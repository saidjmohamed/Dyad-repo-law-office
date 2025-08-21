import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "عنوان المهمة مطلوب"),
  case_id: z.string().uuid().optional().nullable(),
  due_date: z.date().optional().nullable(),
  priority: z.string().optional(),
  done: z.boolean().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      cases (
        case_number,
        clients (
          full_name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("لا يمكن جلب قائمة المهام.");
  }

  return data.map(t => ({
    ...t,
    case_number: t.cases?.case_number,
    client_name: t.cases?.clients?.full_name,
  }));
};

export const createTask = async (taskData: TaskFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...taskData, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw new Error("لا يمكن إنشاء المهمة.");
  }

  return data;
};

export const updateTask = async ({ id, ...taskData }: TaskFormData & { id: string }) => {
  const { data, error } = await supabase
    .from("tasks")
    .update(taskData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw new Error("لا يمكن تحديث المهمة.");
  }

  return data;
};

export const updateTaskStatus = async ({ id, done }: { id: string, done: boolean }) => {
    const { data, error } = await supabase
        .from('tasks')
        .update({ done })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating task status:', error);
        throw new Error('لا يمكن تحديث حالة المهمة.');
    }

    return data;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting task:", error);
    throw new Error("لا يمكن حذف المهمة.");
  }

  return true;
};