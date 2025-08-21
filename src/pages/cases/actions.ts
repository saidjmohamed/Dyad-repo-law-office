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
  
  // The type from Supabase might be an array of objects, where `clients` is one of them.
  // We need to flatten this structure for easier use in the component.
  return data.map(d => ({...d, client_name: d.clients.full_name, clients: undefined }));
};

export const createCase = async (caseData: CaseFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const dataToInsert: { [key: string]: any } = { ...caseData, user_id: user.id };

  if (caseData.filing_date) {
    dataToInsert.filing_date = format(caseData.filing_date, "yyyy-MM-dd");
  }

  const { data, error } = await supabase
    .from("cases")
    .insert([dataToInsert])
    .select()
    .single();

  if (error) {
    console.error("Error creating case:", error);
    throw new Error("لا يمكن إنشاء القضية.");
  }

  return data;
};