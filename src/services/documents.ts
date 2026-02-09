import { supabase } from '../lib/supabase';
import type { Document, DocumentStatus } from '../types';
import { getMyTeamIds } from './teams';

const TRACKING_PREFIX = '#TRK';
const BUCKET = 'documents';

export interface DocumentRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  file_type: string;
  file_size: string;
  tracking_id: string;
  file_path: string | null;
  owner_name: string;
  created_at: string;
  updated_at: string;
  team_id?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
}

function rowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status as DocumentStatus,
    category: row.category,
    createdBy: row.owner_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fileType: row.file_type,
    fileSize: row.file_size,
    trackingId: row.tracking_id,
    ownerName: row.owner_name,
    ownerId: row.user_id,
    teamId: row.team_id ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    assignedToName: row.assigned_to_name ?? undefined,
  };
}

export async function fetchDocuments(userId: string): Promise<Document[]> {
  const teamIds = await getMyTeamIds(userId);

  // Fetch in two queries and merge so team members reliably see shared documents (avoids .or()/.in() syntax issues)
  const [ownResult, teamResult] = await Promise.all([
    supabase.from('documents').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    teamIds.length > 0
      ? supabase.from('documents').select('*').in('team_id', teamIds).order('updated_at', { ascending: false })
      : { data: [] as DocumentRow[], error: null },
  ]);

  if (ownResult.error) throw ownResult.error;
  if (teamResult.error) throw teamResult.error;

  const byId = new Map<string, Document>();
  for (const row of ownResult.data || []) byId.set(row.id, rowToDocument(row));
  for (const row of (teamResult.data as DocumentRow[]) || []) if (!byId.has(row.id)) byId.set(row.id, rowToDocument(row));

  return Array.from(byId.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function formatFileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return bytes + ' Bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function createDocument(params: {
  userId: string;
  ownerName: string;
  title: string;
  description: string;
  category: string;
  status: DocumentStatus;
  file?: File;
  teamId?: string | null;
}): Promise<Document> {
  const { userId, ownerName, title, description, category, status, file, teamId } = params;

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${year}-01-01`);
  const seq = (count ?? 0) + 1;
  const trackingId = `${TRACKING_PREFIX}-${year}-${String(seq).padStart(3, '0')}`;

  const docId = crypto.randomUUID();
  let file_path: string | null = null;
  let file_type = '';
  let file_size = '';

  if (file) {
    const ext = file.name.split('.').pop() || 'bin';
    file_type = ext.toUpperCase();
    file_size = formatFileSizeDisplay(file.size);
  }

  const insertPayload: Record<string, unknown> = {
    id: docId,
    user_id: userId,
    title,
    description: description || '',
    category: category || 'Other',
    status,
    tracking_id: trackingId,
    file_path,
    file_type,
    file_size,
    owner_name: ownerName,
  };
  if (teamId != null && teamId !== '') insertPayload.team_id = teamId;

  const { data: row, error: insertError } = await supabase
    .from('documents')
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    const msg = insertError.message || String(insertError);
    throw new Error(`Could not create document: ${msg}`);
  }

  // 2. Record initial status in history
  const { error: historyError } = await supabase.from('document_history').insert({
    document_id: docId,
    status,
    comment: 'Document created',
    updated_by: ownerName,
  });
  if (historyError) {
    const msg = historyError.message || String(historyError);
    throw new Error(`Document created but history failed: ${msg}`);
  }

  // 3. Upload file to storage if provided
  if (file) {
    const ext = file.name.split('.').pop() || 'bin';
    const safeName = `${docId}.${ext}`;
    file_path = `${userId}/${docId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(file_path, file, { upsert: false });

    if (uploadError) {
      const msg = uploadError.message || String(uploadError);
      // Update row to keep document without file path so document still exists
      await supabase
        .from('documents')
        .update({ file_path: null, file_type: '', file_size: '' })
        .eq('id', docId);
      throw new Error(
        `Document was saved but the file could not be uploaded. ${msg} ` +
          'Check that the Storage bucket "documents" exists in Supabase and that RLS allows uploads.'
      );
    }

    // Update document with file path and size, then re-fetch so we return correct data
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        file_path,
        file_type,
        file_size,
        updated_at: new Date().toISOString(),
      })
      .eq('id', docId);
    if (updateError) {
      const msg = updateError.message || String(updateError);
      throw new Error(`File uploaded but updating document failed: ${msg}`);
    }
    // Return document with file info
    return rowToDocument({
      ...(row as DocumentRow),
      file_path,
      file_type,
      file_size,
    });
  }

  return rowToDocument(row as DocumentRow);
}

export async function updateDocumentTeam(documentId: string, teamId: string | null): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ team_id: teamId, updated_at: new Date().toISOString() })
    .eq('id', documentId);
  if (error) throw error;
}

export async function updateDocumentAssignment(
  documentId: string,
  assignedTo: string | null,
  assignedToName: string | null
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({
      assigned_to: assignedTo,
      assigned_to_name: assignedToName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId);
  if (error) throw error;
}

export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  comment: string,
  updatedBy: string
): Promise<void> {
  const { error: updateErr } = await supabase
    .from('documents')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', documentId);
  if (updateErr) throw updateErr;

  await supabase.from('document_history').insert({
    document_id: documentId,
    status,
    comment: comment || 'Status updated',
    updated_by: updatedBy,
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single();
  if (doc?.file_path) {
    await supabase.storage.from(BUCKET).remove([doc.file_path]);
  }
  const { error } = await supabase.from('documents').delete().eq('id', documentId);
  if (error) throw error;
}

export async function addDocumentHistory(
  documentId: string,
  status: DocumentStatus,
  comment: string,
  updatedBy: string
): Promise<void> {
  await supabase.from('document_history').insert({
    document_id: documentId,
    status,
    comment,
    updated_by: updatedBy,
  });
}

export async function fetchDocumentHistory(documentId: string): Promise<{ id: string; documentId: string; status: DocumentStatus; comment: string; updatedBy: string; timestamp: string }[]> {
  const { data, error } = await supabase
    .from('document_history')
    .select('id, document_id, status, comment, updated_by, created_at')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row: { id: string; document_id: string; status: string; comment: string; updated_by: string; created_at: string }) => ({
    id: row.id,
    documentId: row.document_id,
    status: row.status as DocumentStatus,
    comment: row.comment,
    updatedBy: row.updated_by,
    timestamp: row.created_at,
  }));
}
