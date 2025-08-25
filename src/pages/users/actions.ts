import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'lawyer' | 'assistant';
  // We need to join with auth.users to get the email, which is not directly possible on the client.
  // We will create a view or an RPC for this. For now, let's assume we get it.
  email?: string; 
};

export const getUsers = async (): Promise<UserProfile[]> => {
  // This requires admin privileges, which is enforced by RLS on the 'profiles' table.
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("لا يمكن جلب قائمة المستخدمين. قد لا تملك الصلاحيات الكافية.");
  }
  return data;
};

export const updateUserRole = async ({ id, role }: { id: string; role: 'admin' | 'lawyer' | 'assistant' }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user role:", error);
    throw new Error("فشل تحديث دور المستخدم.");
  }
  return data;
};