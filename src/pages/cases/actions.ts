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
    // Throw the actual database error message for better debugging
    throw new Error(`فشل إنشاء القضية: ${error.message}`);
  }

  return data;
};