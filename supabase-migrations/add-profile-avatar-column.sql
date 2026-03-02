-- Add avatar_url and mobile_number to profiles table.
-- Run this in Supabase SQL Editor if you get "Could not find the 'avatar_url' column".

alter table public.profiles add column if not exists mobile_number text;
alter table public.profiles add column if not exists avatar_url text;
