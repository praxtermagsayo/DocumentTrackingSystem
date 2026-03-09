import { supabase } from '../lib/supabase';
import type { DocumentCategory, DocumentCategoryStatus } from '../types';

export interface DocumentCategoryRow {
    id: string;
    name: string;
    status: string;
    created_by: string;
    created_at: string;
}

function rowToCategory(row: DocumentCategoryRow): DocumentCategory {
    return {
        id: row.id,
        name: row.name,
        status: row.status as DocumentCategoryStatus,
        createdBy: row.created_by,
        createdAt: row.created_at,
    };
}

export async function fetchDocumentCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return (data || []).map((row) => rowToCategory(row as DocumentCategoryRow));
}

export async function createDocumentCategory(
    userId: string,
    name: string,
    status: DocumentCategoryStatus
): Promise<DocumentCategory> {
    const { data, error } = await supabase
        .from('document_categories')
        .insert({
            name: name.trim(),
            status,
            created_by: userId,
        })
        .select()
        .single();

    if (error) throw error;
    return rowToCategory(data as DocumentCategoryRow);
}

export async function updateDocumentCategory(
    id: string,
    name: string,
    status: DocumentCategoryStatus
): Promise<void> {
    const { error } = await supabase
        .from('document_categories')
        .update({ name: name.trim(), status })
        .eq('id', id);
    if (error) throw error;
}

export async function deleteDocumentCategory(id: string): Promise<void> {
    const { error } = await supabase.from('document_categories').delete().eq('id', id);
    if (error) throw error;
}
