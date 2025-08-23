-- Drop RLS policies for backups table
DROP POLICY IF EXISTS "Users can view their own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can insert their own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can delete their own backups" ON public.backups;

-- Drop backups table
DROP TABLE IF EXISTS public.backups;