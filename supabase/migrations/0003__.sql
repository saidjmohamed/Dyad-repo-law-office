-- Create a bucket for avatars with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for 'avatars' bucket

-- 1. Allow public read access to all files in the bucket
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. Allow authenticated users to upload an avatar into a folder named after their user_id
CREATE POLICY "Users can upload their own avatar."
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 3. Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar."
ON storage.objects FOR UPDATE TO authenticated
USING ( auth.uid()::text = (storage.foldername(name))[1] )
WITH CHECK ( bucket_id = 'avatars' );

-- 4. Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar."
ON storage.objects FOR DELETE TO authenticated
USING ( auth.uid()::text = (storage.foldername(name))[1] );