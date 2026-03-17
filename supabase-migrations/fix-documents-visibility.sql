-- Migration: Fix Document Visibility RLS
-- Replacing all fragmented policies with a single, robust policy.

-- 1. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own or team documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own, team, or recipient documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can view any documents" ON public.documents;

-- 2. Create Unified SELECT policy
CREATE POLICY "Unified Document Visibility" ON public.documents
  FOR SELECT USING (
    -- Owner case
    user_id = auth.uid()
    
    -- Recipient case (direct array check)
    OR recipients @> ARRAY[(SELECT email FROM public.profiles WHERE id = auth.uid())]
    
    -- Routing participant case (user is or was a receiver in routing)
    OR EXISTS (
        SELECT 1 FROM public.document_routing
        WHERE document_id = documents.id
        AND receiver_user_id = auth.uid()
    )
  );

-- 3. Ensure profiles are readable by everyone for email lookups if needed, 
-- but we already have a profile policy usually. Just to be safe:
-- DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
-- CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Refresh cache
NOTIFY pgrst, 'reload schema';
