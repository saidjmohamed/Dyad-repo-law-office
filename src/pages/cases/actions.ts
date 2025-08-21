import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

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

export const getCases = async () => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error("لا يمكن جلب قائمة القضايا.");
  }
  
  return data.map(d => ({
    ...d, 
    client_name: d.clients?.full_name || 'غير محدد', 
    clients: undefined 
  }));
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
    data.hearings.sort((a, b) => new Date(b.hearing_date).getTime() - new Date(a.hearing_date).getTime());
  }
  if (data.tasks) {
    data.tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  if (data.case_files) {
    data.case_files.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }
  if (data.financial_transactions) {
    data.financial_transactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }

  return data;
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