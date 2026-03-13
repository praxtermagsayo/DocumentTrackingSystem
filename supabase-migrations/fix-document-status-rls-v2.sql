-- Fix Document Status Synchronization & Acknowledgement Constraints
-- Run this in Supabase SQL Editor

-- 1. FIX STATUS CHECK CONSTRAINT
-- The user reported: ERROR: 23514: violates check constraint "documents_status_check"
-- This is because 'viewed' and 'acknowledged' are missing from the allowed list.
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.documents'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) ILIKE '%status%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.documents DROP CONSTRAINT ' || constraint_name;
    END IF;
    
    ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
        CHECK (status IN ('draft', 'under-review', 'approved', 'rejected', 'archived', 'sent', 'viewed', 'acknowledged'));
END $$;

-- 2. ADD UPDATE POLICY FOR RECIPIENTS ON DOCUMENTS
-- Previously, only owners could update. Now recipients can update (for status/viewed/acknowledged).
DROP POLICY IF EXISTS "Recipients can update document status" ON public.documents;
CREATE POLICY "Recipients can update document status" ON public.documents
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') = ANY(recipients)
    OR (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()))
  );

-- 3. FIX ACKNOWLEDGEMENT CONSTRAINTS
-- The old constraint 'unique_acknowledgement_per_document' limited exactly ONE ack per document.
-- Since we now have multiple files in one document_id, we need a more granular constraint.
ALTER TABLE public.document_acknowledgements 
  DROP CONSTRAINT IF EXISTS unique_acknowledgement_per_document;

-- Add a new unique constraint that allows one acknowledgement per (document, file, user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_ack_per_doc_file_user'
  ) THEN
    ALTER TABLE public.document_acknowledgements
      ADD CONSTRAINT unique_ack_per_doc_file_user UNIQUE (document_id, file_id, acknowledged_by);
  END IF;
END $$;

-- 3. VERIFY HISTORY RLS
-- Ensure history is still writable by recipients (should be done by previous migrations, but safe to re-assert)
DROP POLICY IF EXISTS "Users can add history to visible documents" ON public.document_history;
CREATE POLICY "Users can add history to visible documents" ON public.document_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_history.document_id
        AND (
          d.user_id = auth.uid()
          OR (d.recipients IS NOT NULL AND auth.email() = ANY(d.recipients))
          OR (d.team_id IS NOT NULL AND public.is_team_member(d.team_id, auth.uid()))
        )
    )
  );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
