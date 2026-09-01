REVOKE EXECUTE ON FUNCTION public.get_story_stats(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_story_stats(integer) TO authenticated;