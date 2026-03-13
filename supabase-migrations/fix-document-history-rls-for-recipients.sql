-- Fix document_history RLS: no team check, no direct auth.users table query.
-- Uses auth.email() which reads from the JWT token — no permission issues.
-- Run this in Supabase SQL Editor.

ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;

-- ── SELECT: owner OR email recipient can read history ────────────────────────
DROP POLICY IF EXISTS "Users can view history of visible documents" ON public.document_history;
CREATE POLICY "Users can view history of visible documents" ON public.document_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_history.document_id
        AND (
          d.user_id = auth.uid()
          OR (d.recipients IS NOT NULL AND auth.email() = ANY(d.recipients))
        )
    )
  );

-- ── INSERT: same — owner OR email recipient can write history ─────────────────
DROP POLICY IF EXISTS "Users can add history to visible documents" ON public.document_history;
CREATE POLICY "Users can add history to visible documents" ON public.document_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_history.document_id
        AND (
          d.user_id = auth.uid()
          OR (d.recipients IS NOT NULL AND auth.email() = ANY(d.recipients))
        )
    )
  );
