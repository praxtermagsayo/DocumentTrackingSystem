  -- Fix: "Database error deleting user" - storage.objects FK blocks auth user deletion.
  -- Run ONCE in Supabase SQL Editor. Run diagnose-auth-user-delete-blockers.sql first to confirm the blocker.
  -- See: https://github.com/supabase/storage/issues/65

  do $$
  declare
    r record;
  begin
    for r in (
      select c.conname, a.attname as col_name
      from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey) and a.attnum > 0 and not a.attisdropped
      where c.contype = 'f'
      and c.confrelid = 'auth.users'::regclass
      and c.conrelid = 'storage.objects'::regclass
    ) loop
      execute format('alter table storage.objects drop constraint if exists %I', r.conname);
      execute format(
        'alter table storage.objects add constraint %I foreign key (%I) references auth.users(id) on delete set null',
        r.conname, r.col_name
      );
      raise notice 'Fixed constraint % on storage.objects.%', r.conname, r.col_name;
    end loop;
    if not found then
      raise notice 'No FK from storage.objects to auth.users found - your schema may differ. Run diagnose-auth-user-delete-blockers.sql to see all blockers.';
    end if;
  end $$;
