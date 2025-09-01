-- Fix RLS policies for matches table to allow proper authentication
DROP POLICY IF EXISTS "Authenticated users can manage matches" ON public.matches;

-- Create proper policies for authenticated users
CREATE POLICY "Authenticated users can insert matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update matches" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete matches" 
ON public.matches 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Also fix any potential issues with opposing_teams RLS
DROP POLICY IF EXISTS "Authenticated users can manage opposing teams" ON public.opposing_teams;

CREATE POLICY "Authenticated users can insert opposing teams" 
ON public.opposing_teams 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update opposing teams" 
ON public.opposing_teams 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete opposing teams" 
ON public.opposing_teams 
FOR DELETE 
USING (auth.uid() IS NOT NULL);