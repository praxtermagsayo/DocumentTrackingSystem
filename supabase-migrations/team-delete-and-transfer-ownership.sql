-- Allow team admin to delete the team and to update member roles (for transfer ownership).
-- Run after refine-team-roles.sql.

-- 1. DELETE team: only an admin of the team can delete it
drop policy if exists "Team admins can delete team" on public.teams;
create policy "Team admins can delete team" on public.teams
  for delete using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = teams.id and tm.user_id = auth.uid() and tm.role = 'admin'
    )
  );

-- 2. UPDATE team_members (e.g. role): only admin can update (for transfer ownership / change roles)
drop policy if exists "Team admins can update member roles" on public.team_members;
create policy "Team admins can update member roles" on public.team_members
  for update using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role = 'admin'
    )
  );
