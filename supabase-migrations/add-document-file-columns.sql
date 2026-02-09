-- Add any missing columns to documents so the app can create/update rows.
-- Run this in Supabase SQL Editor if you get errors like: Could not find the 'file_path' or 'owner_name' column of 'documents'.

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'file_path') then
    alter table public.documents add column file_path text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'file_type') then
    alter table public.documents add column file_type text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'file_size') then
    alter table public.documents add column file_size text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'owner_name') then
    alter table public.documents add column owner_name text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'tracking_id') then
    alter table public.documents add column tracking_id text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'created_at') then
    alter table public.documents add column created_at timestamptz default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'updated_at') then
    alter table public.documents add column updated_at timestamptz default now();
  end if;
end $$;
