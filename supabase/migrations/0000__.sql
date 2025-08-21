-- Drop existing tables and policies to ensure a clean re-creation
DROP TABLE IF EXISTS public.case_files CASCADE;
DROP TABLE IF EXISTS public.financial_transactions CASCADE;

-- Create a table for case files
CREATE TABLE public.case_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;

-- Create policies for case files
CREATE POLICY "Users can only see their own case files" ON public.case_files
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own case files" ON public.case_files
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own case files" ON public.case_files
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own case files" ON public.case_files
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create a table for financial transactions
CREATE TABLE public.financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'أتعاب' or 'مصروف'
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all actions
CREATE POLICY "Users can manage their own financial transactions" ON public.financial_transactions
FOR ALL TO authenticated USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);