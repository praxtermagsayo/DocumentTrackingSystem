-- 1. Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on Departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read departments
CREATE POLICY "Departments are viewable by everyone" ON public.departments
    FOR SELECT USING (true);

-- 2. Update Profiles with Department ID
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- 3. Update Documents table with new statuses and routing fields
-- First, update the check constraint to include new statuses
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
    CHECK (status IN ('draft', 'sent', 'viewed', 'acknowledged', 'archived', 'forwarded', 'approved', 'returned', 'rejected', 'completed'));

-- Rename 'sent' to 'forwarded' for existing documents to match new terminology
UPDATE public.documents SET status = 'forwarded' WHERE status = 'sent';

-- Add routing helper column
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS current_routing_step_id UUID;

-- 4. Create Document Routing Steps table
CREATE TABLE IF NOT EXISTS public.document_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    sender_user_id UUID NOT NULL REFERENCES public.profiles(id),
    receiver_user_id UUID REFERENCES public.profiles(id),
    sender_department_id UUID REFERENCES public.departments(id),
    receiver_department_id UUID REFERENCES public.departments(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'forwarded')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action_at TIMESTAMPTZ
);

-- Enable RLS on Routing
ALTER TABLE public.document_routing ENABLE ROW LEVEL SECURITY;

-- Allow users to see routing steps for documents they own or are recipients of
CREATE POLICY "Users can view routing for visible documents" ON public.document_routing
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_routing.document_id
            AND (
                d.user_id = auth.uid() 
                OR d.recipients @> ARRAY[(SELECT email FROM public.profiles WHERE id = auth.uid())]
                -- Also allow the receiver of the step to see it
                OR document_routing.receiver_user_id = auth.uid()
            )
        )
    );

-- 5. Create Unified Document Audit Trail
CREATE TABLE IF NOT EXISTS public.document_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    action_by UUID NOT NULL REFERENCES public.profiles(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'viewed', 'acknowledged', 'approved', 'rejected', 'returned', 'forwarded')),
    from_department_id UUID REFERENCES public.departments(id),
    to_department_id UUID REFERENCES public.departments(id),
    comment TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_days NUMERIC -- Time spent in the state preceding this action
);

-- Enable RLS on Audit Trail
ALTER TABLE public.document_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit trail for visible documents" ON public.document_audit_trail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_audit_trail.document_id
            AND (
                d.user_id = auth.uid() 
                OR d.recipients @> ARRAY[(SELECT email FROM public.profiles WHERE id = auth.uid())]
            )
        )
    );
