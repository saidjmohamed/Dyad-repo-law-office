import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const hearingSchema = z.object({
  case_id: z.string().uuid("يجب اختيار قضية صحيحة").nullable().optional(),
  hearing_date: z.date({ required_error: "تاريخ الجلسة مطلوب" }),
  room: z.string().optional(),
  judge: z.string().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export type HearingFormData = z.infer<typeof hearingSchema>;

export const getHearings = async () => {
  const { data, error } = await supabase
    .from("hearings")
    .select(`
      *,
      cases (
        case_number,
        clients (
          full_name
        )
      )
    `)
    .order("hearing_date", { ascending: true });

  if (error) {
    console.error("Error fetching hearings:", error);
    throw new Error("لا يمكن جلب قائمة الجلسات.");
  }

  return data.map(h => ({
    ...h,
    case_number: h.cases?.case_number,
    client_name: h.cases?.clients?.full_name,
  }));
};

export const createHearing = async (hearingData: HearingFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("hearings")
    .insert([{ ...hearingData, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating hearing:", error);
    throw new Error("لا يمكن إنشاء الجلسة.");
  }

  return data;
};

export const updateHearing = async ({ id, ...hearingData }: HearingFormData & { id: string }) => {
  const { data, error } = await supabase
    .from("hearings")
    .update(hearingData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating hearing:", error);
    throw new Error("لا يمكن تحديث الجلسة.");
  }

  return data;
};

export const deleteHearing = async (id: string) => {
  const { error } = await supabase.from("hearings").delete().eq("id", id);

  if (error) {
    console.error("Error deleting hearing:", error);
    throw new Error("لا يمكن حذف الجلسة.");
  }

  return true;
};