-- If documents table has RLS enabled, team members must be allowed to SELECT rows where team_id is set and they're in that team.
-- Run fix-team-members-rls-recursion.sql first (it creates is_team_member).

alter table public.documents enable row level security;

-- SELECT: own documents or documents shared with a team the user is in
drop policy if exists "Users can view own or team documents" on public.documents;
create policy "Users can view own or team documents" on public.documents
  for select using (
    user_id = auth.uid()
    or (team_id is not null and public.is_team_member(team_id, auth.uid()))
  );

-- INSERT: only as yourself (owner)
drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents" on public.documents
  for insert with check (user_id = auth.uid());

-- UPDATE: only owner
drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents" on public.documents
  for update using (user_id = auth.uid());

-- DELETE: only owner
drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents" on public.documents
  for delete using (user_id = auth.uid());
