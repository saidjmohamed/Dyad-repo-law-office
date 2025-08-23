import { supabase } from "@/integrations/supabase/client";
import { TABLES_TO_BACKUP } from "@/integrations/supabase/constants";

export type BackupFormat = 'json'; // Simplified to JSON for multi-table backup
export type BackupTable = typeof TABLES_TO_BACKUP[number];

export interface BackupMetadata {
  id: string;
  filename: string;
  format: BackupFormat;
  size: number;
  created_at: string;
  storage_path: string;
}

export const getBackups = async (): Promise<BackupMetadata[]> => {
  const { data, error } = await supabase
    .from('backups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching backups:", error);
    throw new Error("لا يمكن جلب قائمة النسخ الاحتياطية.");
  }
  return data;
};

export const createBackup = async (format: BackupFormat, tables: BackupTable[]): Promise<{ filename: string; publicUrl: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("المستخدم غير مسجل الدخول");

  const requestBody = { format, tables };
  console.log("Frontend: Sending backup request with body:", requestBody); // سجل تصحيح جديد

  const { data, error } = await supabase.functions.invoke('create-backup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: requestBody,
  });

  if (error) {
    console.error("Error creating backup:", error);
    throw new Error(data?.error || "فشل إنشاء النسخة الاحتياطية.");
  }
  return data;
};

export const downloadBackup = async (storagePath: string, filename: string) => {
  const { data, error } = await supabase.storage.from('backups').download(storagePath);
  if (error) {
    console.error("Error downloading backup:", error);
    throw new Error("لا يمكن تحميل ملف النسخة الاحتياطية.");
  }
  if (data) {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export const restoreBackup = async (backupId: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("المستخدم غير مسجل الدخول");

  const { data, error } = await supabase.functions.invoke('restore-backup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: { backup_id: backupId },
  });

  if (error) {
    console.error("Error restoring backup:", error);
    throw new Error(data?.error || "فشل استعادة النسخة الاحتياطية.");
  }
};

export const deleteBackup = async (id: string, storagePath: string): Promise<void> => {
  // First, remove the file from storage
  const { error: storageError } = await supabase.storage
    .from('backups')
    .remove([storagePath]);

  if (storageError) {
    console.error("Error deleting backup file from storage:", storageError);
    throw new Error("فشل حذف ملف النسخة الاحتياطية من التخزين.");
  }

  // Then, delete the metadata from the database
  const { error: dbError } = await supabase
    .from('backups')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error("Error deleting backup metadata:", dbError);
    throw new Error("فشل حذف بيانات النسخة الاحتياطية.");
  }
};