import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'case_documents';

export const uploadCaseFile = async ({ caseId, file }: { caseId: string; file: File }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const fileExtension = file.name.split('.').pop();
  const newFileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${user.id}/${caseId}/${newFileName}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw new Error("فشل رفع الملف.");
  }

  // Insert file metadata into the database
  const { data, error: insertError } = await supabase
    .from('case_files')
    .insert({
      case_id: caseId,
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      mime_type: file.type,
      size: file.size,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error inserting file metadata:", insertError);
    // Attempt to remove the orphaned file from storage
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error("فشل حفظ بيانات الملف.");
  }

  return data;
};

export const deleteCaseFile = async ({ id, file_path }: { id: string; file_path: string }) => {
  // First, remove the file from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([file_path]);

  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
    throw new Error("فشل حذف الملف من وحدة التخزين.");
  }

  // Then, delete the metadata from the database
  const { error: dbError } = await supabase
    .from('case_files')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error("Error deleting file metadata:", dbError);
    throw new Error("فشل حذف بيانات الملف.");
  }

  return true;
};

export const downloadCaseFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(filePath);
    if (error) {
        console.error("Error downloading file:", error);
        throw new Error("لا يمكن تحميل الملف.");
    }
    if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};