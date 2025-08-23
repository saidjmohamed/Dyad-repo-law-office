import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const adjournmentSchema = z.object({
  adjournment_date: z.date({ required_error: "تاريخ التأجيل مطلوب" }),
  reason: z.string().optional(),
});

export type AdjournmentFormData = z.infer<typeof adjournmentSchema>;

export const createAdjournment = async ({ caseId, ...adjournmentData }: AdjournmentFormData & { caseId: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("adjournments")
    .insert([{ ...adjournmentData, user_id: user.id, case_id: caseId }])
    .select()
    .single();

  if (error) {
    console.error("Error creating adjournment:", error);
    throw new Error("لا يمكن إنشاء التأجيل.");
  }

  return data;
};

export const updateAdjournment = async ({ id, ...adjournmentData }: AdjournmentFormData & { id: string }) => {
  const { data, error } = await supabase
    .from("adjournments")
    .update(adjournmentData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating adjournment:", error);
    throw new Error("لا يمكن تحديث التأجيل.");
  }

  return data;
};

export const deleteAdjournment = async (id: string) => {
  const { error } = await supabase.from("adjournments").delete().eq("id", id);

  if (error) {
    console.error("Error deleting adjournment:", error);
    throw new Error("لا يمكن حذف التأجيل.");
  }

  return true;
};