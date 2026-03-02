-- Complete setup for profile picture uploads.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Step 0: Add avatar_url and mobile_number to profiles (required for profile settings)
alter table public.profiles add column if not exists mobile_number text;
alter table public.profiles add column if not exists avatar_url text;

-- Step 1: Create avatars bucket (if it doesn't exist)
-- Note: If this fails, create manually: Storage → New bucket → name: avatars, Public: ON
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Step 2: RLS policies so authenticated users can upload to their folder
drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
on storage.objects for select to public
using (bucket_id = 'avatars');
