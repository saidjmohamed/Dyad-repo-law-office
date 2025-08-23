INSERT INTO storage.buckets (id, name, public)
VALUES ('case_attachments_bucket', 'case_attachments_bucket', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Policies for case_attachments_bucket
-- Allow authenticated users to upload files to their own case folders
CREATE POLICY "Allow authenticated uploads to case_attachments_bucket" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case_attachments_bucket' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow authenticated users to view their own files
CREATE POLICY "Allow authenticated reads from case_attachments_bucket" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'case_attachments_bucket' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from case_attachments_bucket" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'case_attachments_bucket' AND auth.uid() = (storage.foldername(name))[1]::uuid);