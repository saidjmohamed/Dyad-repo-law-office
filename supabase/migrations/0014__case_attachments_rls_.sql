CREATE TABLE public.case_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  mime_type TEXT,
  size BIGINT,
  title TEXT,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.case_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their case attachments" ON public.case_attachments
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their case attachments" ON public.case_attachments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their case attachments" ON public.case_attachments
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their case attachments" ON public.case_attachments
FOR DELETE TO authenticated USING (auth.uid() = user_id);