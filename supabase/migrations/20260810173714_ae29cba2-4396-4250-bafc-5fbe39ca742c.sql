-- ============ 1) SERVER-SIDE 2FA VERIFICATION ============

CREATE TABLE IF NOT EXISTS public.two_factor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.two_factor_sessions TO authenticated;
GRANT ALL ON public.two_factor_sessions TO service_role;

ALTER TABLE public.two_factor_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own 2FA sessions" ON public.two_factor_sessions;
CREATE POLICY "Users can view their own 2FA sessions"
ON public.two_factor_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_two_factor_sessions_user ON public.two_factor_sessions(user_id, expires_at DESC);

DROP TRIGGER IF EXISTS update_two_factor_sessions_updated_at ON public.two_factor_sessions;
CREATE TRIGGER update_two_factor_sessions_updated_at
BEFORE UPDATE ON public.two_factor_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Does the user have 2FA configured?
CREATE OR REPLACE FUNCTION public.has_2fa_enrolled(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.secure_totp_secrets s
    WHERE s.user_id = _user_id AND s.encrypted_secret IS NOT NULL
  );
$$;

-- Has the user completed a server-side 2FA verification recently?
CREATE OR REPLACE FUNCTION public.has_verified_2fa(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.two_factor_sessions t
    WHERE t.user_id = _user_id AND t.expires_at > now()
  );
$$;

-- Admin privileges now require a verified 2FA step-up when 2FA is enrolled
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_has boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  ) INTO v_has;

  IF NOT v_has THEN
    RETURN false;
  END IF;

  IF _role <> 'admin'::app_role THEN
    RETURN true;
  END IF;

  IF NOT public.has_2fa_enrolled(_user_id) THEN
    RETURN true;
  END IF;

  RETURN public.has_verified_2fa(_user_id);
END;
$$;

-- Server-only: read TOTP material for verification (service_role only)
CREATE OR REPLACE FUNCTION public.internal_get_totp_material(p_user_id uuid)
RETURNS TABLE(secret text, backup_codes text[])
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_encrypted text;
  v_key text;
BEGIN
  SELECT s.encrypted_secret, s.backup_codes INTO v_encrypted, backup_codes
  FROM public.secure_totp_secrets s WHERE s.user_id = p_user_id;

  IF v_encrypted IS NULL THEN
    RETURN;
  END IF;

  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'TOTP_ENCRYPTION_KEY';
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;

  secret := pgp_sym_decrypt(decode(v_encrypted, 'base64'), v_key);
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_get_totp_material(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_get_totp_material(uuid) TO service_role;

-- Server-only: consume a backup code
CREATE OR REPLACE FUNCTION public.internal_consume_backup_code(p_user_id uuid, p_code text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_codes text[];
BEGIN
  SELECT backup_codes INTO v_codes FROM public.secure_totp_secrets WHERE user_id = p_user_id;
  IF v_codes IS NULL OR NOT (upper(p_code) = ANY (SELECT upper(c) FROM unnest(v_codes) c)) THEN
    RETURN false;
  END IF;

  UPDATE public.secure_totp_secrets
  SET backup_codes = (SELECT array_agg(c) FROM unnest(v_codes) c WHERE upper(c) <> upper(p_code)),
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_consume_backup_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_consume_backup_code(uuid, text) TO service_role;

-- Server-only: record a successful 2FA verification
CREATE OR REPLACE FUNCTION public.internal_record_2fa_verification(p_user_id uuid, p_ttl_minutes integer DEFAULT 480)
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_expires timestamptz := now() + make_interval(mins => GREATEST(1, LEAST(p_ttl_minutes, 1440)));
BEGIN
  DELETE FROM public.two_factor_sessions WHERE expires_at < now();
  INSERT INTO public.two_factor_sessions (user_id, expires_at) VALUES (p_user_id, v_expires);
  RETURN v_expires;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_record_2fa_verification(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_record_2fa_verification(uuid, integer) TO service_role;

-- Never hand the decrypted TOTP secret or backup codes to the browser again
REVOKE EXECUTE ON FUNCTION public.get_totp_secret(uuid) FROM PUBLIC, anon, authenticated;

REVOKE SELECT ON public.secure_totp_secrets FROM anon;
REVOKE SELECT ON public.secure_totp_secrets FROM authenticated;
GRANT SELECT (id, user_id, created_at, updated_at) ON public.secure_totp_secrets TO authenticated;

-- ============ 2) QUIZ ANSWER EXPOSURE ============

DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;

DROP POLICY IF EXISTS "Staff can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Staff can view quiz questions"
ON public.quiz_questions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

REVOKE SELECT ON public.quiz_questions FROM anon;

CREATE OR REPLACE FUNCTION public.get_quiz_questions_public(p_quiz_id uuid)
RETURNS TABLE(id uuid, question text, display_order integer, answers text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT q.id,
         q.question,
         q.display_order,
         (SELECT array_agg(a ORDER BY random())
            FROM unnest(array_append(COALESCE(q.wrong_answers, '{}'::text[]), q.correct_answer)) a)
  FROM public.quiz_questions q
  JOIN public.article_quizzes aq ON aq.id = q.quiz_id
  WHERE q.quiz_id = p_quiz_id AND aq.is_active = true
  ORDER BY q.display_order;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_questions_public(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_quiz_answer(p_question_id uuid, p_answer text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_questions q
    WHERE q.id = p_question_id AND q.correct_answer = p_answer
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, text) TO anon, authenticated;