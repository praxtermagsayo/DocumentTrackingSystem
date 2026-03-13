-- Migration: Add profiles relations and global visibility
-- Execute this file in your Supabase SQL Editor.

-- 1. Fix Foreign Keys to point to `profiles` instead of `auth.users` to allow PostgREST to join profiles easily.
ALTER TABLE public.event_categories
  DROP CONSTRAINT IF EXISTS event_categories_created_by_fkey,
  ADD CONSTRAINT event_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.document_categories
  DROP CONSTRAINT IF EXISTS document_categories_created_by_fkey,
  ADD CONSTRAINT document_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_user_id_fkey,
  ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Document Categories Global Visibility
DROP POLICY IF EXISTS "Users can view own document categories" ON public.document_categories;
DROP POLICY IF EXISTS "Authenticated users can view any document categories" ON public.document_categories;
CREATE POLICY "Authenticated users can view any document categories" ON public.document_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Event Categories Global Visibility
DROP POLICY IF EXISTS "Users can view own event categories" ON public.event_categories;
DROP POLICY IF EXISTS "Authenticated users can view any event categories" ON public.event_categories;
CREATE POLICY "Authenticated users can view any event categories" ON public.event_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Activities Global Visibility
DROP POLICY IF EXISTS "Users can view own activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can view any activities" ON public.activities;
CREATE POLICY "Authenticated users can view any activities" ON public.activities
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Documents Global Visibility (Except Restricted)
DROP POLICY IF EXISTS "Users can view own or team documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own, team, or recipient documents" ON public.documents;
CREATE POLICY "Users can view own, team, or recipient documents" ON public.documents
  FOR SELECT USING (
    user_id = auth.uid()
    OR (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()))
    OR (auth.jwt() ->> 'email') = ANY(recipients)
  );

-- Refresh the PostgREST cache so the new Joins activate immediately
NOTIFY pgrst, 'reload schema';
