import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const clientSchema = z.object({
  full_name: z.string().min(1, "الاسم الكامل مطلوب"),
  national_id: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const getClients = async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error("لا يمكن جلب قائمة الموكلين.");
  }

  return data;
};

export const createClient = async (clientData: ClientFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("clients")
    .insert([{ ...clientData, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw new Error("لا يمكن إنشاء الموكل.");
  }

  return data;
};