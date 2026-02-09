-- Refine team roles: admin (team creator), manager, member.
-- Run after add-teams-and-shared-documents.sql.

-- 1. Backfill owner -> admin and allow admin/manager/member
update public.team_members set role = 'admin' where role = 'owner';
alter table public.team_members drop constraint if exists team_members_role_check;
alter table public.team_members add constraint team_members_role_check
  check (role in ('admin', 'manager', 'member'));
alter table public.team_members alter column role set default 'member';

-- 2. RLS: admins and managers can insert new members (role must be manager or member; admin only for creator)
drop policy if exists "Team owners can insert members" on public.team_members;
create policy "Team admins and managers can insert members" on public.team_members
  for insert with check (
    (role in ('manager', 'member') and exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role in ('admin', 'manager')
    ))
    or exists (select 1 from public.teams where id = team_members.team_id and created_by = auth.uid())
  );

-- 3. RLS: admin can remove anyone; manager can remove only members
drop policy if exists "Team owners can delete members" on public.team_members;
create policy "Team admins and managers can delete members" on public.team_members
  for delete using (
    exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
    or (exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role = 'manager') and team_members.role = 'member')
  );
