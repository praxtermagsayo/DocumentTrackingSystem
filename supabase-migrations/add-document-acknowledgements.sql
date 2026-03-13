-- Document Acknowledgements
-- Allows exactly ONE non-owner user to acknowledge each document file.
-- Run this in Supabase SQL Editor.

-- 1. Create the acknowledgements table
CREATE TABLE IF NOT EXISTS public.document_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  acknowledged_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acknowledged_by_name text NOT NULL,
  acknowledged_at timestamptz DEFAULT now(),

  -- ✨ One user per document: only ONE person can acknowledge each file
  CONSTRAINT unique_acknowledgement_per_document UNIQUE (document_id)
);

ALTER TABLE public.document_acknowledgements ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies

-- Anyone authenticated can view acknowledgements
DROP POLICY IF EXISTS "Authenticated users can view acknowledgements" ON public.document_acknowledgements;
CREATE POLICY "Authenticated users can view acknowledgements" ON public.document_acknowledgements
  FOR SELECT USING (auth.role() = 'authenticated');

-- Any authenticated user (who isn't the owner) can insert — the ownership check is done app-side
DROP POLICY IF EXISTS "Authenticated users can acknowledge documents" ON public.document_acknowledgements;
CREATE POLICY "Authenticated users can acknowledge documents" ON public.document_acknowledgements
  FOR INSERT WITH CHECK (auth.uid() = acknowledged_by);

-- Users can remove their own acknowledgement
DROP POLICY IF EXISTS "Users can remove own acknowledgement" ON public.document_acknowledgements;
CREATE POLICY "Users can remove own acknowledgement" ON public.document_acknowledgements
  FOR DELETE USING (auth.uid() = acknowledged_by);

-- 3. Index for fast lookup by document
CREATE INDEX IF NOT EXISTS idx_doc_acknowledgements_document_id
  ON public.document_acknowledgements(document_id);
