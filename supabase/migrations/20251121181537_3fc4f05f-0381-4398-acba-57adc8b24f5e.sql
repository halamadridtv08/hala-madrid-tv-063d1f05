-- Fix function security: add search_path to normalize_competition_name
CREATE OR REPLACE FUNCTION public.normalize_competition_name(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_canonical_name TEXT;
BEGIN
  -- Try to find canonical name from aliases
  SELECT canonical_name INTO v_canonical_name
  FROM public.competition_aliases
  WHERE is_active = true
    AND (
      LOWER(canonical_name) = LOWER(TRIM(input_name))
      OR LOWER(input_name) = ANY(SELECT LOWER(unnest(aliases)))
    )
  LIMIT 1;
  
  -- If found, return canonical name, otherwise return trimmed input
  RETURN COALESCE(v_canonical_name, TRIM(input_name));
END;
$$;