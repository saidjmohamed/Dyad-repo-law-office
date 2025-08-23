-- Drop RLS policies for 'backups' storage bucket
DROP POLICY IF EXISTS "Users can upload their own backups" ON storage.objects;
DROP POLICY IF EXISTS "Users can download their own backups" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own backups" ON storage.objects;

-- Delete 'backups' storage bucket
DELETE FROM storage.buckets WHERE id = 'backups';