-- Archived documents are visible only to the creator (owner).
-- Team members and other users must not see documents with status = 'archived'.

drop policy if exists "Users can view own or team documents" on public.documents;

create policy "Users can view own or team documents" on public.documents
  for select using (
    -- Owner sees all their documents (including archived)
    user_id = auth.uid()
    or (
      -- Non-owners only see non-archived documents shared with a team they belong to
      (status is null or status is distinct from 'archived')
      and team_id is not null
      and public.is_team_member(team_id, auth.uid())
    )
  );
