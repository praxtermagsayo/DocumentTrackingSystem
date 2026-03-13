-- Refactor Documents table to use a JSONB array for files instead of multiple rows

-- 1. Add new columns to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- 2. Add file_id to history and acknowledgements so we can still track per-file
ALTER TABLE public.document_history ADD COLUMN IF NOT EXISTS file_id UUID;
ALTER TABLE public.document_acknowledgements ADD COLUMN IF NOT EXISTS file_id UUID;

-- 3. Perform the Data Migration safely
DO $$
DECLARE
    rec RECORD;
    parent_id UUID;
    file_obj JSONB;
    files_array JSONB;
BEGIN
    -- Loop through all unique tracking IDs
    FOR rec IN (SELECT DISTINCT tracking_id FROM public.documents WHERE tracking_id IS NOT NULL)
    LOOP
        -- Find the oldest document for this tracking_id to serve as the "Parent" row
        SELECT id INTO parent_id
        FROM public.documents
        WHERE tracking_id = rec.tracking_id
        ORDER BY created_at ASC
        LIMIT 1;

        IF parent_id IS NOT NULL THEN
            -- Build the JSON array of files from all rows sharing this tracking_id
            -- We map the original row 'id' to the new 'id' property in the JSON object
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', d.id,
                    'name', COALESCE(d.original_filename, d.title),
                    'path', d.file_path,
                    'size', d.file_size,
                    'type', d.file_type
                )
            )
            INTO files_array
            FROM public.documents d
            WHERE d.tracking_id = rec.tracking_id AND d.file_path IS NOT NULL;
            
            -- If no files were attached (e.g. metadata only document), ensure it's an empty array
            IF files_array IS NULL THEN
                files_array := '[]'::jsonb;
            END IF;

            -- Update the Parent row with the new files array
            UPDATE public.documents
            SET files = files_array
            WHERE id = parent_id;

            -- 4. Migrate Foreign Keys to point back to the new Parent Row
            -- For any history targeting a child row, redirect its document_id to the parent_id,
            -- and store the child row's original ID into the new file_id column so we don't lose the exact target.
            UPDATE public.document_history
            SET file_id = document_id,
                document_id = parent_id
            WHERE document_id IN (
                SELECT id FROM public.documents WHERE tracking_id = rec.tracking_id AND id != parent_id
            );
            
            -- Same for history that already pointed to the parent row (store its ID as file_id just in case it was a specific file event)
            -- We only map file_id if the comment looks like a file acknowledgement, or broadly we can just map it anyway.
            UPDATE public.document_history
            SET file_id = parent_id
            WHERE document_id = parent_id AND file_id IS NULL;

            UPDATE public.document_acknowledgements
            SET file_id = document_id,
                document_id = parent_id
            WHERE document_id IN (
                SELECT id FROM public.documents WHERE tracking_id = rec.tracking_id AND id != parent_id
            );
            
            UPDATE public.document_acknowledgements
            SET file_id = parent_id
            WHERE document_id = parent_id AND file_id IS NULL;

            -- 5. Delete all the Child rows now that their data is merged and foreign keys are moved
            DELETE FROM public.documents
            WHERE tracking_id = rec.tracking_id AND id != parent_id;
        END IF;
    END LOOP;
END $$;

-- 6. Clean up obsolete columns from documents
ALTER TABLE public.documents DROP COLUMN IF EXISTS tracking_id;
ALTER TABLE public.documents DROP COLUMN IF EXISTS file_path;
ALTER TABLE public.documents DROP COLUMN IF EXISTS original_filename;
ALTER TABLE public.documents DROP COLUMN IF EXISTS file_type;
ALTER TABLE public.documents DROP COLUMN IF EXISTS file_size;
