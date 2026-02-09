-- Add optional link column to notifications for click-to-redirect (e.g. to document).
-- Run in Supabase SQL Editor.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'link'
  ) then
    alter table public.notifications add column link text;
  end if;
end $$;
