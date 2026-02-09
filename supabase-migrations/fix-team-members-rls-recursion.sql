-- Fix infinite recursion in team_members RLS: policies must not query team_members
-- from within team_members policies. Use SECURITY DEFINER helpers that bypass RLS.

-- 1. Helper: is the given user a member of the given team?
create or replace function public.is_team_member(p_team_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = p_user_id
  );
$$;

-- 2. Helper: is the given user an admin or manager of the given team?
create or replace function public.is_team_admin_or_manager(p_team_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = p_user_id and role in ('admin', 'manager')
  );
$$;

-- 3. Helper: can the current user remove the target user from the team? (admin: yes; manager: only if target is member)
create or replace function public.can_remove_team_member(p_team_id uuid, p_target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  curr_role text;
  tgt_role text;
begin
  select role into curr_role from public.team_members where team_id = p_team_id and user_id = auth.uid();
  if curr_role is null then return false; end if;
  if curr_role = 'admin' then return true; end if;
  if curr_role = 'manager' then
    select role into tgt_role from public.team_members where team_id = p_team_id and user_id = p_target_user_id;
    return tgt_role = 'member';
  end if;
  return false;
end;
$$;

-- 4. Teams: SELECT – use helper instead of subquery on team_members
drop policy if exists "Users can view teams they belong to" on public.teams;
create policy "Users can view teams they belong to" on public.teams
  for select using (public.is_team_member(teams.id, auth.uid()));

-- 5. team_members: SELECT – use helper
drop policy if exists "Users can view team members of their teams" on public.team_members;
create policy "Users can view team members of their teams" on public.team_members
  for select using (public.is_team_member(team_members.team_id, auth.uid()));

-- 6. team_members: INSERT – use helper for “am I admin/manager?” and teams for “am I creator?”
drop policy if exists "Team admins and managers can insert members" on public.team_members;
drop policy if exists "Team owners can insert members" on public.team_members;
create policy "Team admins and managers can insert members" on public.team_members
  for insert with check (
    (role in ('manager', 'member') and public.is_team_admin_or_manager(team_members.team_id, auth.uid()))
    or exists (select 1 from public.teams where id = team_members.team_id and created_by = auth.uid())
  );

-- 7. team_members: DELETE – use helper
drop policy if exists "Team admins and managers can delete members" on public.team_members;
drop policy if exists "Team owners can delete members" on public.team_members;
create policy "Team admins and managers can delete members" on public.team_members
  for delete using (public.can_remove_team_member(team_members.team_id, team_members.user_id));

-- 8. Allow authenticated users to execute helpers (policies run as session user)
grant execute on function public.is_team_member(uuid, uuid) to authenticated;
grant execute on function public.is_team_admin_or_manager(uuid, uuid) to authenticated;
grant execute on function public.can_remove_team_member(uuid, uuid) to authenticated;
