-- Migration: Purge Teams Feature
-- Removing all traces of the unused teams and team_members functionality.

-- 1. Drop the team_members and teams tables if they exist
-- These depend on each other, so we use CASCADE or drop in order.
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- 2. Remove the team_id column from the documents table
-- This column is no longer used for visibility or filtering.
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'team_id') THEN
    ALTER TABLE public.documents DROP COLUMN team_id;
  END IF;
END $$;

-- 3. Notify schema reload
NOTIFY pgrst, 'reload schema';
