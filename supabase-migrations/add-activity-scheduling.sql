-- Activity Scheduling System
-- Run this in Supabase SQL Editor.

-- 1. Event categories (name + status)
create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.event_categories enable row level security;

-- RLS: users can manage their own categories
drop policy if exists "Users can view own event categories" on public.event_categories;
create policy "Users can view own event categories" on public.event_categories
  for select using (created_by = auth.uid());
drop policy if exists "Users can insert own event categories" on public.event_categories;
create policy "Users can insert own event categories" on public.event_categories
  for insert with check (created_by = auth.uid());
drop policy if exists "Users can update own event categories" on public.event_categories;
create policy "Users can update own event categories" on public.event_categories
  for update using (created_by = auth.uid());
drop policy if exists "Users can delete own event categories" on public.event_categories;
create policy "Users can delete own event categories" on public.event_categories
  for delete using (created_by = auth.uid());

create index if not exists idx_event_categories_created_by on public.event_categories(created_by);

-- 2. Activities (post date, event start/end, category, description)
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_date date not null,
  event_start timestamptz not null,
  event_end timestamptz not null,
  category_id uuid not null references public.event_categories(id) on delete restrict,
  description text,
  created_at timestamptz default now(),
  constraint event_end_after_start check (event_end > event_start)
);

alter table public.activities enable row level security;

-- RLS: users can manage their own activities
drop policy if exists "Users can view own activities" on public.activities;
create policy "Users can view own activities" on public.activities
  for select using (user_id = auth.uid());
drop policy if exists "Users can insert own activities" on public.activities;
create policy "Users can insert own activities" on public.activities
  for insert with check (user_id = auth.uid());
drop policy if exists "Users can update own activities" on public.activities;
create policy "Users can update own activities" on public.activities
  for update using (user_id = auth.uid());
drop policy if exists "Users can delete own activities" on public.activities;
create policy "Users can delete own activities" on public.activities
  for delete using (user_id = auth.uid());

create index if not exists idx_activities_user_id on public.activities(user_id);
create index if not exists idx_activities_post_date on public.activities(post_date);
create index if not exists idx_activities_event_start on public.activities(event_start);
