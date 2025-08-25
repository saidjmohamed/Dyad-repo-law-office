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

interface GetHearingsFilters {
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: 'first' | 'adjournment' | 'all';
}

export const getHearings = async (filters: GetHearingsFilters = {}) => {
  let query = supabase
    .from("hearings")
    .select(`
      *,
      case:cases (
        id,
        case_number,
        client:clients (
          full_name
        )
      )
    `);

  if (filters.dateFrom) {
    query = query.gte('hearing_date', filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    query = query.lte('hearing_date', filters.dateTo.toISOString());
  }

  if (filters.type === 'first') {
    query = query.eq('notes', 'الجلسة الأولى (آلي)');
  } else if (filters.type === 'adjournment') {
    // Exclude the automatically created first hearing, or include hearings with no notes
    query = query.or('notes.not.eq.الجلسة الأولى (آلي),notes.is.null');
  }

  query = query.order("hearing_date", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching hearings:", error);
    throw new Error("لا يمكن جلب قائمة الجلسات.");
  }

  let mappedData = data.map((h: any) => ({
    ...h,
    case_number: h.case?.case_number,
    client_name: h.case?.client?.full_name,
  }));

  // Client-side filtering for search term as it involves a joined table
  if (filters.searchTerm) {
    const lowercasedFilter = filters.searchTerm.toLowerCase();
    mappedData = mappedData.filter(h =>
      (h.case_number && h.case_number.toLowerCase().includes(lowercasedFilter)) ||
      (h.client_name && h.client_name.toLowerCase().includes(lowercasedFilter))
    );
  }

  return mappedData;
};


export const getCases = async (): Promise<CaseWithClientName[]> => {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      id,
      case_number,
      client:clients (
        full_name
      )
    `)
    .order("case_number", { ascending: true });

  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error("لا يمكن جلب قائمة القضايا.");
  }

  // Map the data to ensure client_name is always a string
  return data.map((c: any) => ({
    id: c.id,
    case_number: c.case_number,
    client_name: c.client ? c.client.full_name : 'غير معروف',
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