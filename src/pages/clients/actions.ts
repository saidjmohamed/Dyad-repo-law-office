import { supabase } from "@/integrations/supabase/client";

export const createClient = async (clientData: {
  full_name: string;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  date_of_birth?: string | null; // New field
  father_name?: string | null; // New field
  profession?: string | null; // New field
}) => {
  const { data, error } = await supabase.from("clients").insert([clientData]).select();
  if (error) throw error;
  return data;
};

export const getClients = async ({ query }: { query?: string }) => {
  let queryBuilder = supabase.from("clients").select("*");

  if (query) {
    queryBuilder = queryBuilder.ilike("full_name", `%${query}%`);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
};

export const updateClient = async ({ id, ...clientData }: {
  id: string;
  full_name: string;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  date_of_birth?: string | null; // New field
  father_name?: string | null; // New field
  profession?: string | null; // New field
}) => {
  const { data, error } = await supabase.from("clients").update(clientData).eq("id", id).select();
  if (error) throw error;
  return data;
};

export const deleteClient = async (id: string) => {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
};