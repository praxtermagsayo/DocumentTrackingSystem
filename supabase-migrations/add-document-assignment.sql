-- Add assignment fields for document tracking: who is responsible for this document.
-- Run in Supabase SQL Editor.

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'assigned_to') then
    alter table public.documents add column assigned_to uuid references auth.users(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'assigned_to_name') then
    alter table public.documents add column assigned_to_name text;
  end if;
end $$;
