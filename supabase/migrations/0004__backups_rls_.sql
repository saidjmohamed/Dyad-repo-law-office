-- Create backups table
CREATE TABLE public.backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  format TEXT NOT NULL,
  size BIGINT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Policies for backups table
CREATE POLICY "Users can view their own backups" ON public.backups
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backups" ON public.backups
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backups" ON public.backups
FOR DELETE TO authenticated USING (auth.uid() = user_id);