import { supabase } from "@/integrations/supabase/client";
import { CaseFormValues, PartyFormValues } from "./caseSchema"; // Import PartyFormValues

export interface Case {
  id: string;
  case_category: string;
  procedure_type: string;
  case_number?: string | null;
  registered_at?: string | null;
  court_name?: string | null;
  province?: string | null;
  jurisdiction_section?: string | null;
  appeal_to_court?: string | null;
  supreme_court_chamber?: string | null;

  // Criminal Details
  criminal_offense_type?: string | null;
  complaint_filed_with?: string | null;
  investigation_number?: string | null;

  // Appeal Details
  original_case_number?: string | null;
  original_judgment_date?: string | null;
  appellant_or_opponent?: string | null;
  grounds_of_appeal?: string | null;

  // Procedural Dates
  first_hearing_date?: string | null;
  last_postponement_date?: string | null;
  postponement_reason?: string | null;
  next_hearing_date?: string | null;
  judgment_text?: string | null;
  statute_of_limitations?: string | null;

  // Finance
  fees_amount?: number | null;
  fees_status?: string | null;
  fees_notes?: string | null;

  // Notes
  internal_notes?: string | null;
  public_summary?: string | null;

  // Audit/Access Control
  created_by?: string | null;
  created_at: string;
  last_modified_by?: string | null;
  updated_at?: string | null;
  access_control?: string[] | null;

  user_id: string; // Owner of the case
  status?: string | null; // Added status property

  // Relations (for fetching, not direct storage in 'cases' table)
  client_id?: string | null; // Still linking to clients table
  client_name?: string | null; // For display purposes
  case_parties?: CaseParty[] | null;
  case_attachments?: CaseAttachment[] | null;
  hearings?: any[] | null; // Assuming existing hearings structure
  tasks?: any[] | null; // Assuming existing tasks structure
  financial_transactions?: any[] | null; // Assuming existing financial_transactions structure
  adjournments?: any[] | null; // Assuming existing adjournments structure
}

export interface CaseParty {
  id: string;
  case_id: string;
  user_id: string;
  party_type: 'plaintiff' | 'defendant' | 'other';
  role?: string | null;
  name: string;
  role_detail?: string | null;
  address?: string | null;
  id_number?: string | null;
  contact?: string | null;
  representative?: string | null;
  created_at: string;
}

export interface CaseAttachment {
  id: string;
  case_id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  mime_type?: string | null;
  size?: number | null;
  title?: string | null;
  description?: string | null;
  uploaded_at: string;
}

interface GetCasesFilters {
  searchTerm?: string;
  filterCaseCategory?: string;
  filterCourtName?: string;
  filterStatus?: string;
  filterRegisteredAtFrom?: string;
  filterRegisteredAtTo?: string;
  filterClientId?: string;
}

export const getCases = async (filters?: GetCasesFilters): Promise<Case[]> => {
  let query = supabase
    .from("cases")
    .select(`
      *,
      clients (full_name)
    `);

  if (filters?.searchTerm) {
    query = query.ilike('case_number', `%${filters.searchTerm}%`); // Example, adjust as needed for full-text search
  }
  if (filters?.filterCaseCategory) {
    query = query.eq('case_category', filters.filterCaseCategory);
  }
  if (filters?.filterCourtName) {
    query = query.eq('court_name', filters.filterCourtName);
  }
  if (filters?.filterStatus) {
    query = query.eq('status', filters.filterStatus);
  }
  if (filters?.filterRegisteredAtFrom) {
    query = query.gte('registered_at', filters.filterRegisteredAtFrom);
  }
  if (filters?.filterRegisteredAtTo) {
    query = query.lte('registered_at', filters.filterRegisteredAtTo);
  }
  if (filters?.filterClientId) {
    query = query.eq('client_id', filters.filterClientId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

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
      clients (full_name),
      case_parties (*),
      case_attachments (*),
      hearings (*),
      tasks (*),
      financial_transactions (*),
      adjournments (*)
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

// Helper to insert/update parties
const manageCaseParties = async (caseId: string, userId: string, parties: PartyFormValues[]) => {
  const existingParties = await supabase.from('case_parties').select('id').eq('case_id', caseId);
  const existingPartyIds = existingParties.data?.map(p => p.id) || [];
  const incomingPartyIds = parties.filter(p => p.id).map(p => p.id);

  // Delete removed parties
  const partiesToDelete = existingPartyIds.filter(id => !incomingPartyIds.includes(id));
  if (partiesToDelete.length > 0) {
    const { error } = await supabase.from('case_parties').delete().in('id', partiesToDelete);
    if (error) throw error;
  }

  // Insert new parties and update existing ones
  for (const party of parties) {
    const partyToSave = {
      ...party,
      case_id: caseId,
      user_id: userId,
      // Ensure 'id' is only included for updates, not inserts
      ...(party.id && { id: party.id }),
    };

    if (party.id && existingPartyIds.includes(party.id)) {
      // Update existing
      const { error } = await supabase.from('case_parties').update(partyToSave).eq('id', party.id);
      if (error) throw error;
    } else {
      // Insert new (remove id if it's a temporary one from the form)
      const { id, ...insertPartyData } = partyToSave; // Destructure to remove id for insert
      const { error } = await supabase.from('case_parties').insert(insertPartyData);
      if (error) throw error;
    }
  }
};


export const createCase = async (caseData: CaseFormValues): Promise<Case> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول.");

  const { plaintiffs, defendants, other_parties, ...coreCaseData } = caseData;

  // Convert Date objects to ISO strings for Supabase insertion
  const dataToInsert = {
    ...coreCaseData,
    registered_at: coreCaseData.registered_at ? coreCaseData.registered_at.toISOString() : null,
    original_judgment_date: coreCaseData.original_judgment_date ? coreCaseData.original_judgment_date.toISOString() : null,
    first_hearing_date: coreCaseData.first_hearing_date ? coreCaseData.first_hearing_date.toISOString() : null,
    last_postponement_date: coreCaseData.last_postponement_date ? coreCaseData.last_postponement_date.toISOString() : null,
    next_hearing_date: coreCaseData.next_hearing_date ? coreCaseData.next_hearing_date.toISOString() : null,
    created_at: new Date().toISOString(), // Always set created_at on creation
    updated_at: null, // Not modified yet
    user_id: user.id,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("cases")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Error creating case:", error);
    throw new Error("فشل إنشاء القضية.");
  }

  // Insert parties
  const allParties = [
    ...plaintiffs.map(p => ({ ...p, party_type: 'plaintiff' as const })),
    ...defendants.map(p => ({ ...p, party_type: 'defendant' as const })),
    ...(other_parties || []).map(p => ({ ...p, party_type: 'other' as const })),
  ];
  await manageCaseParties(data.id, user.id, allParties);

  return data;
};

export const updateCase = async ({ id, ...caseData }: { id: string } & CaseFormValues): Promise<Case> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول.");

  const { plaintiffs, defendants, other_parties, ...coreCaseData } = caseData;

  // Convert Date objects to ISO strings for Supabase update
  const dataToUpdate = {
    ...coreCaseData,
    registered_at: coreCaseData.registered_at ? coreCaseData.registered_at.toISOString() : null,
    original_judgment_date: coreCaseData.original_judgment_date ? coreCaseData.original_judgment_date.toISOString() : null,
    first_hearing_date: coreCaseData.first_hearing_date ? coreCaseData.first_hearing_date.toISOString() : null,
    last_postponement_date: coreCaseData.last_postponement_date ? coreCaseData.last_postponement_date.toISOString() : null,
    next_hearing_date: coreCaseData.next_hearing_date ? coreCaseData.next_hearing_date.toISOString() : null,
    updated_at: new Date().toISOString(), // Always set updated_at on update
    last_modified_by: user.id,
  };

  const { data, error } = await supabase
    .from("cases")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating case:", error);
    throw new Error("فشل تحديث القضية.");
  }

  // Update parties if provided
  const allParties = [
    ...(plaintiffs || []).map(p => ({ ...p, party_type: 'plaintiff' as const })),
    ...(defendants || []).map(p => ({ ...p, party_type: 'defendant' as const })),
    ...(other_parties || []).map(p => ({ ...p, party_type: 'other' as const })),
  ];
  await manageCaseParties(id, user.id, allParties);

  return data;
};

export const deleteCase = async (id: string) => {
  const { error } = await supabase.from("cases").delete().eq("id", id);

  if (error) {
    console.error("Error deleting case:", error);
    throw new Error("لا يمكن حذف القضية.");
  }

  return true;
};