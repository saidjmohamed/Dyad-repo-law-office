-- Create a bucket for backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false) -- Set to false for private access
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for 'backups' bucket

-- 1. Allow authenticated users to upload backups into a folder named after their user_id
CREATE POLICY "Users can upload their own backups"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'backups' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 2. Allow authenticated users to download their own backups
CREATE POLICY "Users can download their own backups"
ON storage.objects FOR SELECT TO authenticated
USING ( bucket_id = 'backups' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 3. Allow authenticated users to delete their own backups
CREATE POLICY "Users can delete their own backups"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'backups' AND auth.uid()::text = (storage.foldername(name))[1] );