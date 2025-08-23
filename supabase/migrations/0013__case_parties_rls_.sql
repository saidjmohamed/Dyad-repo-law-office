CREATE TABLE public.case_parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  party_type TEXT NOT NULL, -- 'plaintiff', 'defendant', 'other'
  role TEXT, -- For 'other' parties (e.g., 'ضحية', 'شاهد')
  name TEXT NOT NULL,
  role_detail TEXT,
  address TEXT,
  id_number TEXT,
  contact TEXT,
  representative TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.case_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their case parties" ON public.case_parties
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their case parties" ON public.case_parties
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their case parties" ON public.case_parties
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their case parties" ON public.case_parties
FOR DELETE TO authenticated USING (auth.uid() = user_id);