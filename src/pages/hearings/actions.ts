import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const hearingSchema = z.object({
  case_id: z.string().uuid("يجب اختيار قضية صحيحة").nullable(),
  hearing_date: z.date({ required_error: "تاريخ الجلسة مطلوب" }),
  room: z.string().optional(),
  judge: z.string().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export type HearingFormData = z.infer<typeof hearingSchema>;

// Define a type for the data returned by getCases
export type CaseWithClientName = {
  id: string;
  case_number: string;
  client_name: string;
};

export const getHearings = async () => {
  const { data, error } = await supabase
    .from("hearings")
    .select(`
      *,
      cases (
        id,
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

export const getCases = async (): Promise<CaseWithClientName[]> => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      id,
      case_number,
      clients (
        full_name
      )
    `)
    .order("case_number", { ascending: true });

  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error("لا يمكن جلب قائمة القضايا.");
  }

  // Map the data to ensure client_name is always a string
  return data.map(c => {
    // Supabase might return a single related record as an object or an array with one item.
    // This handles both cases safely.
    const client = Array.isArray(c.clients) ? c.clients[0] : c.clients;
    return {
      id: c.id,
      case_number: c.case_number,
      client_name: client?.full_name || 'غير معروف',
    };
  });
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("hearings")
    .update({ ...hearingData, user_id: user.id })
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