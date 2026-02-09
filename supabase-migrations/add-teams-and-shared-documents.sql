-- Teams: real teams with members so users can view each other's documents.
-- Run this in Supabase SQL Editor.

-- 0. Profiles (so we can look up user id by email for "invite by email")
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text
);
alter table public.profiles enable row level security;
drop policy if exists "Anyone can view profiles" on public.profiles;
create policy "Anyone can view profiles" on public.profiles for select to authenticated using (true);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (id = auth.uid());

-- 1. Teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 2. Team members (user can be in many teams)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz default now(),
  unique(team_id, user_id)
);

-- 3. Add team_id to documents (nullable; when set, all team members can see it)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'team_id') then
    alter table public.documents add column team_id uuid references public.teams(id) on delete set null;
  end if;
end $$;

-- 4. Indexes
create index if not exists idx_team_members_user_id on public.team_members(user_id);
create index if not exists idx_team_members_team_id on public.team_members(team_id);
create index if not exists idx_documents_team_id on public.documents(team_id);

-- 5. RLS (optional but recommended): allow read for own docs or team docs
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "Users can view teams they belong to" on public.teams;
create policy "Users can view teams they belong to" on public.teams
  for select using (
    exists (select 1 from public.team_members where team_id = teams.id and user_id = auth.uid())
  );
drop policy if exists "Users can insert team when they are creator" on public.teams;
create policy "Users can insert team when they are creator" on public.teams
  for insert with check (created_by = auth.uid());

drop policy if exists "Users can view team members of their teams" on public.team_members;
create policy "Users can view team members of their teams" on public.team_members
  for select using (
    exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
  );
drop policy if exists "Team owners can insert members" on public.team_members;
create policy "Team owners can insert members" on public.team_members
  for insert with check (
    exists (select 1 from public.team_members where team_id = team_members.team_id and user_id = auth.uid() and role = 'owner')
    or exists (select 1 from public.teams where id = team_members.team_id and created_by = auth.uid())
  );
drop policy if exists "Team owners can delete members" on public.team_members;
create policy "Team owners can delete members" on public.team_members
  for delete using (
    exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role = 'owner')
  );

-- Documents RLS: if you use RLS on documents, add a policy for team visibility.
-- If documents table doesn't have RLS yet, the app will filter by user_id OR team_id in (user's teams) in the client.
-- Uncomment below if you enable RLS on documents:
/*
alter table public.documents enable row level security;
drop policy if exists "Users can view own or team documents" on public.documents;
create policy "Users can view own or team documents" on public.documents
  for select using (
    user_id = auth.uid()
    or (team_id is not null and exists (
      select 1 from public.team_members where team_id = documents.team_id and user_id = auth.uid()
    ))
  );
-- Keep existing insert/update/delete for owner only (add if you have them).
*/
