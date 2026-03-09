-- Add recipients column to documents and update status constraint
-- Run this in Supabase SQL Editor

do $$
begin
  -- 1. Add recipients column if missing
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'recipients') then
    alter table public.documents add column recipients text[] default '{}';
  end if;

  -- 2. Update status constraint to include 'sent'
  -- First, we need to find the name of the constraint if it exists.
  -- Often it's named documents_status_check
  declare
    constraint_name text;
  begin
    select conname into constraint_name
    from pg_constraint 
    where conrelid = 'public.documents'::regclass 
    and contype = 'c' 
    and pg_get_constraintdef(oid) ilike '%status%';

    if constraint_name is not null then
      execute 'alter table public.documents drop constraint ' || constraint_name;
    end if;
    
    alter table public.documents add constraint documents_status_check 
      check (status in ('draft', 'under-review', 'approved', 'rejected', 'archived', 'sent'));
  end;
end $$;
