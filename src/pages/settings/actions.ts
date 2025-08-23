import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const AVATARS_BUCKET = 'avatars';

// Fetch the current user's profile
export const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    throw new Error("لا يمكن جلب بيانات الملف الشخصي.");
  }

  return data;
};

// Upload a new avatar and update the profile
export const uploadAvatar = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("نوع الملف غير صالح. يرجى اختيار صورة (jpg, png).");
  }
  if (file.size > 5 * 1024 * 1024) { // 5MB
    throw new Error("حجم الملف كبير جدًا. الحد الأقصى هو 5 ميغابايت.");
  }

  const fileExtension = file.name.split('.').pop();
  const filePath = `${user.id}/${uuidv4()}.${fileExtension}`;

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    throw new Error("فشل رفع الصورة.");
  }

  // Get the public URL of the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error("لم يتم العثور على رابط الصورة بعد الرفع.");
  }

  // Update the avatar_url in the user's profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) {
    console.error("Error updating profile avatar URL:", updateError);
    // Attempt to clean up the orphaned file in storage
    await supabase.storage.from(AVATARS_BUCKET).remove([filePath]);
    throw new Error("فشل تحديث رابط الصورة في الملف الشخصي.");
  }

  return { avatar_url: publicUrl };
};