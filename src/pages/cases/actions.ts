import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { format } from "date-fns";

export const caseSchema = z.object({
  case_type: z.string().min(1, "نوع القضية مطلوب"),
  court: z.string().min(1, "اسم المحكمة مطلوب"),
  case_number: z.string().min(1, "رقم القضية مطلوب"),
  filing_date: z.date().optional().nullable(),
  status: z.string().optional(),
  client_id: z.string().uuid("يجب اختيار موكل صحيح"),
  notes: z.string().optional(),
});

export type CaseFormData = z.infer<typeof caseSchema>;

interface GetCasesFilters {
  searchTerm?: string;
  case_type?: string;
  court?: string;
  status?: string;
  filing_date_from?: Date;
  filing_date_to?: Date;
  client_id?: string;
}

export const getCases = async (filters?: GetCasesFilters) => {
  let query = supabase
    .from("cases")
    .select(`
      *,
      clients (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.searchTerm) {
    const searchTsQuery = filters.searchTerm.split(' ').map(term => `${term}:*`).join(' & ');
    query = query.filter('search_vector', '@@', searchTsQuery);
  }

  if (filters?.case_type) {
    query = query.eq('case_type', filters.case_type);
  }
  if (filters?.court) {
    query = query.ilike('court', `%${filters.court}%`);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.filing_date_from) {
    query = query.gte('filing_date', format(filters.filing_date_from, 'yyyy-MM-dd'));
  }
  if (filters?.filing_date_to) {
    query = query.lte('filing_date', format(filters.filing_date_to, 'yyyy-MM-dd'));
  }
  if (filters?.client_id) {
    query = query.eq('client_id', filters.client_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error(`لا يمكن جلب قائمة القضايا: ${error.message}`);
  }
  
  return data.map(d => ({
    ...d, 
    client_name: d.clients?.full_name || 'غير محدد', 
    clients: undefined 
  }));
};

// Define types for nested data structures
type ClientDetails = {
  id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
};

type HearingDetails = {
  id: string;
  hearing_date: string;
  result?: string | null;
  created_at: string;
};

type TaskDetails = {
  id: string;
  title: string;
  done: boolean;
  due_date?: string | null;
  created_at: string;
};

type CaseFileDetails = {
  id: string;
  file_name: string; // Added missing properties
  file_path: string; // Added missing properties
  mime_type?: string | null;
  size: number; // Added missing properties
  uploaded_at: string;
};

type FinancialTransactionDetails = {
  id: string;
  transaction_type: 'أتعاب' | 'مصروف'; // Added missing properties
  description: string; // Added missing properties
  amount: number; // Added missing properties
  transaction_date: string;
};

type CaseDetailsData = {
  id: string;
  case_number: string;
  status: string;
  case_type: string;
  court: string;
  filing_date?: string | null;
  notes?: string | null;
  clients: ClientDetails;
  hearings: HearingDetails[];
  tasks: TaskDetails[];
  case_files: CaseFileDetails[];
  financial_transactions: FinancialTransactionDetails[];
};


export const getCaseById = async (id: string) => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (*),
      hearings (*),
      tasks (*),
      case_files (*),
      financial_transactions (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching case details:", error);
    // Throw the actual database error message for better debugging
    throw new Error(`فشل جلب تفاصيل القضية: ${error.message}`);
  }

  if (data.hearings) {
    data.hearings.sort((a: HearingDetails, b: HearingDetails) => new Date(b.hearing_date).getTime() - new Date(a.hearing_date).getTime());
  }
  if (data.tasks) {
    data.tasks.sort((a: TaskDetails, b: TaskDetails) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  if (data.case_files) {
    data.case_files.sort((a: CaseFileDetails, b: CaseFileDetails) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }
  if (data.financial_transactions) {
    data.financial_transactions.sort((a: FinancialTransactionDetails, b: FinancialTransactionDetails) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }

  return data as CaseDetailsData;
};


export const createCase = async (caseData: CaseFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const dataToInsert = { ...caseData, user_id: user.id };

  const { data, error } = await supabase
    .from("cases")
    .insert([dataToInsert])
    .select()
    .single();

  if (error) {
    console.error("Error creating case:", error);
    throw new Error(`فشل إنشاء القضية: ${error.message}`);
  }

  return data;
};

export const updateCase = async ({ id, ...caseData }: CaseFormData & { id: string }) => {
  const { data, error } = await supabase
    .from("cases")
    .update(caseData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating case:", error);
    throw new Error(`فشل تحديث القضية: ${error.message}`);
  }

  return data;
};

export const deleteCase = async (id: string) => {
  const { error } = await supabase.from("cases").delete().eq("id", id);

  if (error) {
    console.error("Error deleting case:", error);
    throw new Error("لا يمكن حذف القضية.");
  }

  return true;
};