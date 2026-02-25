-- Run this FIRST in Supabase SQL Editor to see what blocks auth user deletion.
-- Copy the output and use it to fix the constraint.

select
  c.conname as constraint_name,
  c.conrelid::regclass as table_blocking_delete,
  a.attname as column_in_that_table,
  confrelid::regclass as references_table
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey) and a.attnum > 0 and not a.attisdropped
where c.contype = 'f'
and c.confrelid = 'auth.users'::regclass
order by c.conrelid::regclass::text;
