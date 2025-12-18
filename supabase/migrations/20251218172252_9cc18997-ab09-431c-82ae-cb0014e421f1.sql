-- Fix notify_admin_on_comment() function - add SET search_path to prevent search path manipulation attacks
CREATE OR REPLACE FUNCTION public.notify_admin_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, entity_id, entity_type)
  VALUES (
    'comment',
    'Nouveau commentaire',
    'Un nouveau commentaire de ' || NEW.user_name || ' attend votre approbation.',
    NEW.id,
    'comment'
  );
  RETURN NEW;
END;
$function$;