-- Use the existing 'documents' bucket for avatars (path: avatars/userId/avatar.ext)
-- No new bucket needed. Run this in Supabase SQL Editor.

-- Allow authenticated users to upload their avatar to documents/avatars/{userId}/
drop policy if exists "Users can upload avatar to documents bucket" on storage.objects;
create policy "Users can upload avatar to documents bucket"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = 'avatars' and
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to update their own avatar
drop policy if exists "Users can update avatar in documents bucket" on storage.objects;
create policy "Users can update avatar in documents bucket"
on storage.objects for update to authenticated
using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = 'avatars' and
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own avatar
drop policy if exists "Users can delete avatar from documents bucket" on storage.objects;
create policy "Users can delete avatar from documents bucket"
on storage.objects for delete to authenticated
using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = 'avatars' and
  (storage.foldername(name))[2] = auth.uid()::text
);
