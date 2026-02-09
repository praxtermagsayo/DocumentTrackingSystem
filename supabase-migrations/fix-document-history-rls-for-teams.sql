-- Allow team members to view (and add) document history for documents they can see.
-- Run after fix-team-members-rls-recursion.sql (uses is_team_member).

alter table public.document_history enable row level security;

-- SELECT: user can see history if they can see the document (owner or team member)
drop policy if exists "Users can view history of visible documents" on public.document_history;
create policy "Users can view history of visible documents" on public.document_history
  for select using (
    exists (
      select 1 from public.documents d
      where d.id = document_history.document_id
      and (d.user_id = auth.uid() or (d.team_id is not null and public.is_team_member(d.team_id, auth.uid())))
    )
  );

-- INSERT: user can add history if they can see the document (so team members can add comments / status updates)
drop policy if exists "Users can add history to visible documents" on public.document_history;
create policy "Users can add history to visible documents" on public.document_history
  for insert with check (
    exists (
      select 1 from public.documents d
      where d.id = document_history.document_id
      and (d.user_id = auth.uid() or (d.team_id is not null and public.is_team_member(d.team_id, auth.uid())))
    )
  );
