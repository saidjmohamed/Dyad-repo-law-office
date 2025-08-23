import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Define the schema for a party
export const partySchema = z.object({
  id: z.string().optional(),
  case_id: z.string(),
  full_name: z.string().min(1, "الاسم الكامل مطلوب"),
  father_name: z.string().optional().nullable(),
  mother_name: z.string().optional().nullable(),
  national_id: z.string().optional().nullable(),
  date_of_birth: z.date().optional().nullable(),
  nationality: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().nullable().or(z.literal('')),
  occupation: z.string().optional().nullable(),
  marital_status: z.string().optional().nullable(),
  party_type: z.enum(["مدعي", "مدعى عليه", "متهم", "ضحية", "طرف مدني", "آخر"]).default("مدعي"),
});

export type PartyFormData = z.infer<typeof partySchema>;
export type Party = PartyFormData & { id: string; created_at: string; user_id: string; };

// Define the schema for a case
export const caseSchema = z.object({
  client_id: z.string().min(1, "الموكل مطلوب"),
  case_type: z.string().min(1, "نوع القضية مطلوب"),
  case_category: z.string().min(1, "فئة القضية مطلوبة (مدني/جزائي)"),
  court: z.string().min(1, "المحكمة/المجلس مطلوب"),
  court_division_or_chamber: z.string().min(1, "القسم/الغرفة مطلوب"),
  case_number: z.string().min(1, "رقم القضية مطلوب"),
  filing_date: z.date().optional().nullable(),
  role_in_favor: z.string().optional().nullable(),
  role_against: z.string().optional().nullable(),
  appeal_type: z.string().optional().nullable(),
  complaint_number: z.string().optional().nullable(),
  complaint_registration_date: z.date().optional().nullable(),
  complaint_status: z.string().optional().nullable(),
  complaint_followed_by: z.string().optional().nullable(),
  fees_estimated: z.number().min(0, "الرسوم المقدرة يجب أن تكون موجبة").optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CaseFormData = z.infer<typeof caseSchema>;

// Define types for nested relations
type Client = {
  id: string;
  full_name: string;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

type Hearing = {
  id: string;
  hearing_date: string;
  room?: string | null;
  judge?: string | null;
  result?: string | null;
  notes?: string | null;
};

type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: string | null;
  case_id: string;
};

type CaseFile = {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  size: number;
};

type FinancialTransaction = {
  id: string;
  transaction_type: 'أتعاب' | 'مصروف';
  description: string;
  amount: number;
  transaction_date: string;
};

type Adjournment = {
  id: string;
  adjournment_date: string;
  reason?: string | null;
};

export type Case = CaseFormData & {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  client_name: string;
  clients: Client; // Nested client data
  parties: Party[]; // Nested parties data
  hearings: Hearing[]; // Nested hearings data
  tasks: Task[]; // Nested tasks data
  case_files: CaseFile[]; // Nested case files data
  financial_transactions: FinancialTransaction[]; // Nested financial transactions data
  adjournments: Adjournment[]; // Nested adjournments data
  status?: string | null; // Add status here as it's used in Index.tsx
};

export async function getCases(
  filterCaseCategory?: string,
  filterDivisionOrChamber?: string,
  filterAppealType?: string,
  searchQuery?: string
): Promise<Case[]> {
  let query = supabase
    .from("cases")
    .select(`
      *,
      clients (full_name)
    `)
    .order("created_at", { ascending: false });

  if (filterCaseCategory) {
    query = query.eq("case_category", filterCaseCategory);
  }
  if (filterDivisionOrChamber) {
    query = query.eq("court_division_or_chamber", filterDivisionOrChamber);
  }
  if (filterAppealType) {
    query = query.eq("appeal_type", filterAppealType);
  }
  if (searchQuery) {
    query = query.textSearch("search_vector", `'${searchQuery}'`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map((c: any) => ({
    ...c,
    client_name: c.clients?.full_name || "N/A",
  }));
}

export async function getCaseById(id: string): Promise<Case> {
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (full_name),
      parties (*),
      hearings (*),
      tasks (*),
      case_files (*),
      financial_transactions (*),
      adjournments (*)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    ...data,
    client_name: data.clients?.full_name || "N/A",
    parties: data.parties || [],
    hearings: data.hearings || [],
    tasks: data.tasks || [],
    case_files: data.case_files || [],
    financial_transactions: data.financial_transactions || [],
    adjournments: data.adjournments || [],
  };
}

export async function createCase(caseData: CaseFormData): Promise<Case> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const { data, error } = await supabase
    .from("cases")
    .insert({ ...caseData, user_id: user.id })
    .select(`
      *,
      clients (full_name)
    `)
    .single();
  if (error) throw error;
  return { ...data, client_name: data.clients?.full_name || "N/A" };
}

export async function updateCase(caseData: Partial<CaseFormData> & { id: string }): Promise<Case> {
  const { id, ...updateData } = caseData;
  const { data, error } = await supabase
    .from("cases")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      clients (full_name)
    `)
    .single();
  if (error) throw error;
  return { ...data, client_name: data.clients?.full_name || "N/A" };
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
}

// Party actions
export async function getPartiesByCaseId(caseId: string): Promise<Party[]> {
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createParty(partyData: Omit<PartyFormData, 'id'>): Promise<Party> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const { data, error } = await supabase
    .from("parties")
    .insert({ ...partyData, user_id: user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateParty(partyData: Partial<PartyFormData> & { id: string }): Promise<Party> {
  const { id, ...updateData } = partyData;
  const { data, error } = await supabase
    .from("parties")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteParty(id: string): Promise<void> {
  const { error } = await supabase.from("parties").delete().eq("id", id);
  if (error) throw error;
}