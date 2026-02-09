-- Fix: new row violates row-level security policy for table "teams"
-- and: team_members_role_check (allow admin/manager/member).
-- Use an RPC for team creation so it bypasses RLS; ensure role constraint allows 'admin'.

-- 1. Allow roles admin, manager, member (in case refine-team-roles.sql was not run)
update public.team_members set role = 'admin' where role = 'owner';
alter table public.team_members drop constraint if exists team_members_role_check;
alter table public.team_members add constraint team_members_role_check
  check (role in ('admin', 'manager', 'member'));
alter table public.team_members alter column role set default 'member';

-- 2. RPC for creating a team (bypasses RLS; sets creator as admin)
create or replace function public.create_team(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_team_id uuid;
  v_team json;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  insert into public.teams (name, created_by)
  values (trim(p_name), v_uid)
  returning id into v_team_id;
  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_uid, 'admin');
  select json_build_object(
    'id', t.id,
    'name', t.name,
    'created_by', t.created_by,
    'created_at', t.created_at
  ) into v_team
  from public.teams t
  where t.id = v_team_id;
  return v_team;
end;
$$;

grant execute on function public.create_team(text) to authenticated;

-- Optional: keep RLS policy so direct inserts still work if auth.uid() is set correctly
alter table public.teams enable row level security;
drop policy if exists "Users can insert team when they are creator" on public.teams;
create policy "Users can insert team when they are creator" on public.teams
  for insert
  with check (created_by = auth.uid());
