import { supabase } from "@/integrations/supabase/client";

export interface Case {
  id: string;
  case_type: string;
  court?: string | null;
  division?: string | null;
  criminal_subtype?: string | null; // حقل جديد
  case_number: string;
  filing_date?: string | null;
  role_in_favor?: string | null;
  role_against?: string | null;
  last_adjournment_date?: string | null;
  last_adjournment_reason?: string | null;
  next_hearing_date?: string | null;
  judgment_summary?: string | null;
  status: string;
  client_id?: string | null;
  client_name?: string | null; // لأغراض العرض، لا يتم تخزينه مباشرة
  fees_estimated?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  user_id: string;
}

export const getCases = async (): Promise<Case[]> => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error("لا يمكن جلب قائمة القضايا.");
  }

  return data.map((c: any) => ({
    ...c,
    client_name: c.clients?.full_name || "غير محدد",
  }));
};

export const getCase = async (id: string): Promise<Case> => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (full_name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching case:", error);
    throw new Error("لا يمكن جلب تفاصيل القضية.");
  }

  return {
    ...data,
    client_name: data.clients?.full_name || "غير محدد",
  };
};

export const createCase = async (caseData: Omit<Case, "id" | "created_at" | "updated_at" | "user_id" | "client_name">): Promise<Case> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول.");

  const { data, error } = await supabase
    .from("cases")
    .insert({ ...caseData, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating case:", error);
    throw new Error("فشل إنشاء القضية.");
  }
  return data;
};

export const updateCase = async (id: string, caseData: Partial<Omit<Case, "id" | "created_at" | "updated_at" | "user_id" | "client_name">>): Promise<Case> => {
  const { data, error } = await supabase
    .from("cases")
    .update({ ...caseData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating case:", error);
    throw new Error("فشل تحديث القضية.");
  }
  return data;
};

export const deleteCase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("cases")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting case:", error);
    throw new Error("فشل حذف القضية.");
  }
};