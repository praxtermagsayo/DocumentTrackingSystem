-- Add mobile_number and avatar_url to profiles
alter table public.profiles add column if not exists mobile_number text;
alter table public.profiles add column if not exists avatar_url text;
