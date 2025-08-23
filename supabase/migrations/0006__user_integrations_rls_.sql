-- Drop RLS policies for user_integrations table
DROP POLICY IF EXISTS "Users can only see their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can only insert their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can only update their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can only delete their own integrations" ON public.user_integrations;

-- Drop user_integrations table
DROP TABLE IF EXISTS public.user_integrations;