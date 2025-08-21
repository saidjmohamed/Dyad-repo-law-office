import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const financialTransactionSchema = z.object({
  transaction_type: z.enum(["أتعاب", "مصروف"], { required_error: "نوع المعاملة مطلوب" }),
  description: z.string().min(1, "الوصف مطلوب"),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون رقمًا موجبًا"),
  transaction_date: z.date({ required_error: "تاريخ المعاملة مطلوب" }),
});

export type FinancialTransactionFormData = z.infer<typeof financialTransactionSchema>;

export const createFinancialTransaction = async ({ caseId, ...transactionData }: FinancialTransactionFormData & { caseId: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("financial_transactions")
    .insert([{ ...transactionData, user_id: user.id, case_id: caseId }])
    .select()
    .single();

  if (error) {
    console.error("Error creating financial transaction:", error);
    throw new Error("لا يمكن إنشاء المعاملة المالية.");
  }

  return data;
};

export const updateFinancialTransaction = async ({ id, ...transactionData }: FinancialTransactionFormData & { id: string }) => {
  const { data, error } = await supabase
    .from("financial_transactions")
    .update(transactionData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating financial transaction:", error);
    throw new Error("لا يمكن تحديث المعاملة المالية.");
  }

  return data;
};

export const deleteFinancialTransaction = async (id: string) => {
  const { error } = await supabase.from("financial_transactions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting financial transaction:", error);
    throw new Error("لا يمكن حذف المعاملة المالية.");
  }

  return true;
};