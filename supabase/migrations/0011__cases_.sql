-- Drop existing RLS policies for 'cases' table to allow schema modification
DROP POLICY IF EXISTS "Users can manage their own cases" ON public.cases;

-- Drop existing foreign key constraints that might prevent column drops
ALTER TABLE public.hearings DROP CONSTRAINT IF EXISTS hearings_case_id_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_case_id_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_case_id_fkey;
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_case_id_fkey;
ALTER TABLE public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_case_id_fkey;
ALTER TABLE public.adjournments DROP CONSTRAINT IF EXISTS adjournments_case_id_fkey;
ALTER TABLE public.case_files DROP CONSTRAINT IF EXISTS case_files_case_id_fkey;

-- Drop columns that are being replaced or are no longer needed
ALTER TABLE public.cases
DROP COLUMN IF EXISTS case_type,
DROP COLUMN IF EXISTS division,
DROP COLUMN IF EXISTS filing_date,
DROP COLUMN IF EXISTS role_in_favor,
DROP COLUMN IF EXISTS role_against,
DROP COLUMN IF EXISTS last_adjournment_date,
DROP COLUMN IF EXISTS last_adjournment_reason,
DROP COLUMN IF EXISTS next_hearing_date,
DROP COLUMN IF EXISTS judgment_summary,
DROP COLUMN IF EXISTS fees_estimated,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS criminal_subtype,
DROP COLUMN IF EXISTS court; -- Drop existing 'court' column as it will be re-added with new constraints/type if needed

-- Add new columns as per the detailed schema
ALTER TABLE public.cases
ADD COLUMN case_category TEXT NOT NULL DEFAULT 'مدني', -- Renamed from case_type
ADD COLUMN procedure_type TEXT NOT NULL DEFAULT 'قضية جديدة',
ADD COLUMN registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN court_name TEXT,
ADD COLUMN province TEXT,
ADD COLUMN jurisdiction_section TEXT,
ADD COLUMN appeal_to_court TEXT,
ADD COLUMN supreme_court_chamber TEXT,
ADD COLUMN first_hearing_date DATE,
ADD COLUMN last_postponement_date DATE,
ADD COLUMN postponement_reason TEXT,
ADD COLUMN next_hearing_date DATE,
ADD COLUMN judgment_text TEXT,
ADD COLUMN statute_of_limitations TEXT,
ADD COLUMN fees_amount NUMERIC DEFAULT 0,
ADD COLUMN fees_status TEXT DEFAULT 'غير مدفوع',
ADD COLUMN fees_notes TEXT,
ADD COLUMN internal_notes TEXT,
ADD COLUMN public_summary TEXT,
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Will store user_id
ADD COLUMN last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Will store user_id
ADD COLUMN access_control TEXT[], -- For multiselect options
ADD COLUMN criminal_offense_type TEXT,
ADD COLUMN complaint_filed_with TEXT,
ADD COLUMN investigation_number TEXT,
ADD COLUMN original_case_number TEXT,
ADD COLUMN original_judgment_date DATE,
ADD COLUMN appellant_or_opponent TEXT,
ADD COLUMN grounds_of_appeal TEXT;

-- Update existing columns to match new schema requirements if necessary
ALTER TABLE public.cases ALTER COLUMN case_number DROP DEFAULT; -- Remove default if any
ALTER TABLE public.cases ALTER COLUMN status SET DEFAULT 'جديدة'; -- Ensure default status is 'جديدة'

-- Re-add foreign key constraints for related tables
ALTER TABLE public.hearings ADD CONSTRAINT hearings_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD CONSTRAINT documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD CONSTRAINT notes_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
ALTER TABLE public.financial_transactions ADD CONSTRAINT financial_transactions_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
ALTER TABLE public.adjournments ADD CONSTRAINT adjournments_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
ALTER TABLE public.case_files ADD CONSTRAINT case_files_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

-- Re-enable RLS for 'cases' table and create policies
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cases" ON public.cases
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" ON public.cases
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" ON public.cases
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" ON public.cases
FOR DELETE TO authenticated USING (auth.uid() = user_id);