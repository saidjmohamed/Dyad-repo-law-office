import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const caseSchema = z.object({
  client_id: z.string().uuid("يجب اختيار موكل صحيح"),
  case_type: z.string({ required_error: "نوع القضية مطلوب" }),
  court: z.string({ required_error: "جهة التقاضي مطلوبة" }),
  division: z.string().optional(),
  case_number: z.string({ required_error: "رقم القضية مطلوب" }),
  filing_date: z.date().optional().nullable(),
  role_in_favor: z.string().optional(),
  role_against: z.string().optional(),
  fees_estimated: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().optional()
  ),
  notes: z.string().optional(),
});

export type CaseFormData = z.infer<typeof caseSchema>;

export const getCases = async (filters: {
  searchTerm?: string;
  filterCaseType?: string;
  filterCourt?: string;
  filterStatus?: string;
  filterFilingDateFrom?: string;
  filterFilingDateTo?: string;
  filterClientId?: string;
} = {}) => {
  let query = supabase
    .from("cases")
    .select("*, clients(full_name)")
    .order("created_at", { ascending: false });

  if (filters.searchTerm) {
    query = query.textSearch('search_vector', filters.searchTerm, { type: 'websearch' });
  }
  if (filters.filterCaseType) {
    query = query.eq('case_type', filters.filterCaseType);
  }
  if (filters.filterCourt) {
    query = query.eq('court', filters.filterCourt);
  }
  if (filters.filterStatus) {
    query = query.eq('status', filters.filterStatus);
  }
  if (filters.filterFilingDateFrom) {
    query = query.gte('filing_date', filters.filterFilingDateFrom);
  }
  if (filters.filterFilingDateTo) {
    query = query.lte('filing_date', filters.filterFilingDateTo);
  }
  if (filters.filterClientId) {
    query = query.eq('client_id', filters.filterClientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error("لا يمكن جلب قائمة القضايا.");
  }
  return data;
};

export const getCaseById = async (id: string) => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients(*),
      hearings(*),
      tasks(*),
      documents(*),
      notes(*),
      financial_transactions(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching case with id ${id}:`, error);
    throw new Error("لا يمكن جلب تفاصيل القضية.");
  }

  return data;
};

export const createCase = async (caseData: CaseFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("cases")
    .insert([{ ...caseData, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating case:", error);
    throw new Error("لا يمكن إنشاء القضية.");
  }

  return data;
};

export const updateCase = async ({ id, ...caseData }: CaseFormData & { id: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("cases")
    .update({ ...caseData, user_id: user.id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating case:", error);
    throw new Error("لا يمكن تحديث القضية.");
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