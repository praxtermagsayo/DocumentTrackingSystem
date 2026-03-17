import { supabase } from '../lib/supabase';
import type { Document, DocumentStatus, DocumentAcknowledgement } from '../types';

const TRACKING_PREFIX = '#TRK';
const BUCKET = 'documents';

export interface DocumentRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  owner_name: string;
  created_at: string;
  updated_at: string;
  recipients?: string[] | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  files?: any[] | null;
  document_routing?: any[] | null;
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
    files: Array.isArray(row.files) ? row.files : [],
    recipients: row.recipients || [],
    ownerName: row.owner_name,
    ownerId: row.user_id,
    routingSteps: Array.isArray(row.document_routing) ? row.document_routing : [],
  };
}

export async function fetchDocuments(userId: string, userEmail: string): Promise<Document[]> {
  // 1. Find document IDs where user is a participant in routing
  const { data: routingDocs, error: routingError } = await supabase
    .from('document_routing')
    .select('document_id')
    .eq('receiver_user_id', userId);

  if (routingError) console.error('Error fetching routing participations:', routingError);
  
  const participations = (routingDocs || []).map(r => r.document_id);
  const participationOr = participations.length > 0 ? `,id.in.(${participations.join(',')})` : '';

  // 2. Build the OR filter for documents the user owns, is a recipient of, or participated in routing for
  const { data, error } = await supabase
    .from('documents')
    .select('*, document_routing(*)')
    .or(`user_id.eq.${userId},recipients.cs.{${userEmail}}${participationOr}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  const documents = (data || []).map((row) => rowToDocument(row as DocumentRow));
  return documents;
}

export async function getFileUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600); // 1 hour expiry
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

function formatFileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return bytes + ' Bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export interface RoutingStepInput {
  email: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
}

// We remove createDocument and fold its logic directly below
export async function createDocuments(params: {
  userId: string;
  ownerName: string;
  ownerEmail?: string;
  title: string;
  description: string;
  category: string;
  status: DocumentStatus;
  recipients?: string[];
  routingSteps?: RoutingStepInput[];
  files: File[];
}): Promise<Document> {
  const { files, userId, ownerName, ownerEmail, title, description, category, status, recipients, routingSteps } = params;
  const docId = crypto.randomUUID();

  // 1. Build the files JSON array and upload each
  const uploadedFiles = [];

  for (const file of files) {
    const fileId = crypto.randomUUID();
    const ext = file.name.split('.').pop() || 'bin';
    const file_path = `${userId}/${docId}/${fileId}.${ext}`;
    const file_type = ext.toUpperCase();
    const file_size = formatFileSizeDisplay(file.size);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(file_path, file, { upsert: false });

    if (uploadError) {
      throw new Error(`Failed to upload file ${file.name}: ${uploadError.message}`);
    }

    uploadedFiles.push({
      id: fileId,
      name: file.name,
      path: file_path,
      size: file_size,
      type: file_type,
    });
  }

  // 2. Insert the single document row
  const insertPayload = {
    id: docId,
    user_id: userId,
    title,
    description: description || '',
    category: category || 'Other',
    status,
    recipients: recipients || [],
    files: uploadedFiles,
    owner_name: ownerName,
  };

  const { data: row, error: insertError } = await supabase
    .from('documents')
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    throw new Error(`Could not create document: ${insertError.message}`);
  }

  // 3. Create Routing Steps if provided
  if (routingSteps && routingSteps.length > 0) {
    // We need to find the user IDs for these emails
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, department_id')
      .in('email', routingSteps.map(s => s.email));

    const routingPayload = routingSteps.map((step, index) => {
      const profile = profiles?.find(p => p.email === step.email);
      return {
        document_id: docId,
        step_number: index + 1,
        sender_user_id: userId,
        receiver_user_id: profile?.id,
        receiver_department_id: profile?.department_id || step.departmentId,
        status: index === 0 ? 'pending' : 'pending', // All start pending in routing
        comment: index === 0 ? 'Initial routing step' : null
      };
    });

    const { error: routingError } = await supabase
      .from('document_routing')
      .insert(routingPayload);

    if (routingError) console.error('Failed to create routing steps:', routingError);
  }

  // 4. Record in Unified Audit Trail
  const { error: auditError } = await supabase.from('document_audit_trail').insert({
    document_id: docId,
    action_by: userId,
    action_type: 'created',
    comment: `Document created and forwarded by ${ownerName}`,
  });

  if (auditError) console.error('Failed to record audit trail:', auditError);

  // 5. Record in legacy history for backward compatibility
  await supabase.from('document_history').insert({
    document_id: docId,
    status,
    comment: `Document created by ${ownerName}`,
    updated_by: ownerEmail || ownerName,
  });

  return rowToDocument(row as DocumentRow);
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

export async function updateDocumentBatchStatus(
  trackingId: string,
  status: DocumentStatus,
  comment: string,
  updatedBy: string
): Promise<void> {
  const { error: updateErr } = await supabase
    .from('documents')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('tracking_id', trackingId);

  if (updateErr) throw updateErr;

  // Add a history item for each document in the batch
  const { data: docs } = await supabase
    .from('documents')
    .select('id')
    .eq('tracking_id', trackingId);

  if (docs && docs.length > 0) {
    const historyEntries = docs.map(d => ({
      document_id: d.id,
      status,
      comment: comment || 'Batch status updated',
      updated_by: updatedBy,
    }));
    await supabase.from('document_history').insert(historyEntries);
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { data: doc } = await supabase
    .from('documents')
    .select('files')
    .eq('id', documentId)
    .single();

  if (doc?.files && Array.isArray(doc.files)) {
    const paths = doc.files.map((f: any) => f.path).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
  }

  const { error } = await supabase.from('documents').delete().eq('id', documentId);
  if (error) throw error;
}

/**
 * Update the recipients (shared emails) for every document in a tracking batch.
 * This replaces the old "share with permission" flow.
 */
export async function updateDocumentRecipients(
  documentId: string,
  recipients: string[]
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ recipients, updated_at: new Date().toISOString() })
    .eq('id', documentId);
  if (error) throw error;
}

/**
 * Record a "viewed" event in document_history when a recipient opens a document.
 *
 * Rules:
 *  - Lifetime deduplication: only one history entry per (document_id, viewer_name) ever.
 *  - Updates the status of ALL files in the same batch (same tracking_id) from 'sent' → 'viewed'.
 *  - Sends a notification to the document owner (once, on first view).
 *  - Returns true if a new view was recorded, false if already seen (caller can skip refreshDocuments).
 */
export async function recordDocumentView(
  documentId: string,
  viewerName: string,
  viewerUserId: string,
  viewerEmail?: string
): Promise<boolean> {
  // ── 1. Update status Transition ALL files in the batch from 'sent' → 'viewed' ─
  //       (never downgrade 'acknowledged' back to 'viewed')
  //       We do this BEFORE the deduplication check to ensure any 'sent' docs
  //       get updated if a recipient views them, even if they've viewed before.
  const { data: doc, error: fetchErr } = await supabase
    .from('documents')
    .select('user_id, title, status')
    .eq('id', documentId)
    .single();

  if (fetchErr || !doc) return false;

  const { error: updateErr } = await supabase
    .from('documents')
    .update({ status: 'viewed', updated_at: new Date().toISOString() })
    .eq('id', documentId)
    // viewed can come from sent or forwarded
    .in('status', ['sent', 'forwarded']);

  if (updateErr) {
    console.error('Error updating document status to viewed:', updateErr);
  }

  // ── 2. Lifetime history deduplication ─────────────────────────────────────
  const { data: existing } = await supabase
    .from('document_history')
    .select('id')
    .eq('document_id', documentId)
    .eq('status', 'viewed')
    .in('updated_by', viewerEmail ? [viewerName, viewerEmail] : [viewerName])
    .limit(1);

  // Still return true because we might have just updated the real status from 'sent' to 'viewed'
  // and the UI needs to know to refresh.
  if (existing && existing.length > 0) return true;

  // ── 3. Insert history entry ───────────────────────────────────────────────
  await supabase.from('document_history').insert({
    document_id: documentId,
    status: 'viewed',
    comment: `Viewed by ${viewerName}`,
    updated_by: viewerEmail || viewerName,
  });

  // ── 4. We don't need a redundant tracking update since the document is a single row ──

  // ── 5. Notify the document owner ─────────────────────────────────────────
  if (doc.user_id && doc.user_id !== viewerUserId) {
    const { createNotification } = await import('./notifications');
    await createNotification({
      userId: doc.user_id,
      title: 'Document Viewed',
      message: `${viewerName} viewed your document "${doc.title}"`,
      type: 'info',
      link: `/documents/${documentId}`,
    }).catch(() => {/* silent — notification failure must not break view recording */ });
  }

  return true; // new view was logged
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
    .order('created_at', { ascending: false });
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

export interface RecentActivityItem {
  id: string;
  documentId: string;
  documentTitle: string;
  action: string;
  updatedBy: string;
  timestamp: string;
}

function statusToAction(status: string): string {
  switch (status) {
    case 'draft': return 'created';
    case 'under-review': return 'submitted for review';
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'archived': return 'archived';
    default: return 'updated';
  }
}

export async function fetchRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  const { data, error } = await supabase
    .from('document_history')
    .select('id, document_id, status, comment, updated_by, created_at, documents(title)')
    .order('created_at', { ascending: false })
    .limit(limit); // No need to over-fetch and group since rows are no longer duplicated per file

  if (error) throw error;

  const rows = (data || []) as Array<{
    id: string;
    document_id: string;
    status: string;
    comment: string;
    updated_by: string;
    created_at: string;
    documents: { title?: string } | null;
  }>;

  return rows.map(row => {
    let action = statusToAction(row.status);
    if (row.comment && row.comment !== 'Document created' && row.comment !== 'Status updated') {
      action += `: ${row.comment}`;
    }

    return {
      id: row.id,
      documentId: row.document_id,
      documentTitle: row.documents?.title ?? 'Unknown document',
      action,
      updatedBy: row.updated_by,
      timestamp: row.created_at,
    };
  });
}

// ─── Document Acknowledgements ────────────────────────────────────────────────


/** Fetch acknowledgements for a list of document IDs. */
export async function fetchAcknowledgements(documentIds: string[]): Promise<DocumentAcknowledgement[]> {
  if (documentIds.length === 0) return [];
  const { data, error } = await supabase
    .from('document_acknowledgements')
    .select('id, document_id, file_id, acknowledged_by, acknowledged_by_name, acknowledged_at')
    .in('document_id', documentIds);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    documentId: row.document_id,
    fileId: row.file_id,
    userId: row.acknowledged_by,
    acknowledgedByName: row.acknowledged_by_name,
    timestamp: row.acknowledged_at,
  }));
}

/** Acknowledge a document (as a whole). Throws if already acknowledged by same user for this session. */
export async function acknowledgeDocument(
  documentId: string,
  userId: string,
  displayName: string,
  fileId?: string
): Promise<DocumentAcknowledgement> {
  const { data, error } = await supabase
    .from('document_acknowledgements')
    .insert({
      document_id: documentId,
      file_id: fileId || null,
      acknowledged_by: userId,
      acknowledged_by_name: displayName
    })
    .select('id, document_id, file_id, acknowledged_by, acknowledged_by_name, acknowledged_at')
    .single();

  if (error) throw error;

  // Record in Audit Trail
  await supabase.from('document_audit_trail').insert({
    document_id: documentId,
    action_by: userId,
    action_type: 'acknowledged',
    comment: 'Document acknowledged'
  });

  // Record in History
  await supabase.from('document_history').insert({
    document_id: documentId,
    status: 'acknowledged',
    comment: 'Document acknowledged',
    updated_by: displayName
  });

  // 3. Update main document status
  await supabase
    .from('documents')
    .update({ status: 'acknowledged', updated_at: new Date().toISOString() })
    .eq('id', documentId)
    // can only acknowledge if viewed, sent or forwarded
    .in('status', ['sent', 'forwarded', 'viewed']);

  return {
    id: data.id,
    documentId: data.document_id,
    fileId: data.file_id,
    userId: data.acknowledged_by,
    acknowledgedByName: data.acknowledged_by_name,
    timestamp: data.acknowledged_at,
  };
}

// ─── Document Routing & Workflow ──────────────────────────────────────────────

export interface DocumentRoutingStep {
  id: string;
  document_id: string;
  step_number: number;
  sender_user_id: string;
  receiver_user_id: string;
  receiver_department_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'viewed' | 'forwarded';
  comment: string | null;
  created_at: string;
  action_at: string | null;
  receiver_name?: string;
  receiver_email?: string;
  receiver_department_name?: string;
}

export async function fetchDocumentRouting(documentId: string): Promise<DocumentRoutingStep[]> {
  const { data, error } = await supabase
    .from('document_routing')
    .select(`
      *,
      receiver:profiles!receiver_user_id(display_name, email),
      department:departments!receiver_department_id(name)
    `)
    .eq('document_id', documentId)
    .order('step_number', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    ...row,
    receiver_name: row.receiver?.display_name,
    receiver_email: row.receiver?.email,
    receiver_department_name: row.department?.name
  }));
}

export async function processRoutingAction(
  documentId: string,
  stepId: string,
  action: 'approve' | 'reject' | 'return',
  userId: string,
  userName: string,
  comment?: string
): Promise<void> {
  const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned';
  const now = new Date().toISOString();

  // 1. Update the current routing step
  const { error: stepErr } = await supabase
    .from('document_routing')
    .update({
      status,
      comment: comment || null,
      action_at: now
    })
    .eq('id', stepId);

  if (stepErr) throw stepErr;

  // 2. Add to Unified Audit Trail
  const { error: auditErr } = await supabase.from('document_audit_trail').insert({
    document_id: documentId,
    action_by: userId,
    action_type: status,
    comment: comment || `Document ${status} by ${userName}`
  });

  if (auditErr) console.error('Audit trail error:', auditErr);

  // 3. Update main document status based on action
  let docStatus: DocumentStatus = 'forwarded';
  if (action === 'reject') docStatus = 'rejected';
  else if (action === 'return') docStatus = 'returned';
  else if (action === 'approve') {
    // Check current step number
    const { data: currStep } = await supabase
      .from('document_routing')
      .select('step_number')
      .eq('id', stepId)
      .single();
    
    const currNum = currStep?.step_number || 0;

    // Check if there's a next step
    const { data: nextStep } = await supabase
      .from('document_routing')
      .select('id')
      .eq('document_id', documentId)
      .gt('step_number', currNum)
      .order('step_number', { ascending: true })
      .limit(1);

    if (!nextStep || nextStep.length === 0) {
      docStatus = 'completed'; // No more steps
    } else {
      docStatus = 'approved'; // Intermediate approval
    }
  }

  await supabase
    .from('documents')
    .update({ status: docStatus, updated_at: now })
    .eq('id', documentId);
}

export async function forwardDocument(params: {
  documentId: string;
  currentStepId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverEmail: string;
  receiverName: string;
  receiverDeptId: string;
  comment?: string;
  isToPresidency?: boolean;
}): Promise<void> {
  const { documentId, currentStepId, senderId, senderName, receiverId, receiverEmail, receiverName, receiverDeptId, comment, isToPresidency } = params;
  const now = new Date().toISOString();

  // Determine standard comment based on context if no custom comment provided
  let finalComment = comment;
  if (!finalComment) {
    if (!currentStepId) {
      finalComment = "Initial routing step";
    } else if (isToPresidency) {
      finalComment = "Forwarded to Office of the President";
    } else {
      finalComment = "Forwarded to next department";
    }
  }

  // 1. If there's a current step, mark it as approved
  if (currentStepId) {
    const { error: stepErr } = await supabase
      .from('document_routing')
      .update({
        status: 'approved',
        action_at: now,
        comment: finalComment
      })
      .eq('id', currentStepId);
    if (stepErr) throw stepErr;
  }

  // 2. Find the next step number
  const { data: steps } = await supabase
    .from('document_routing')
    .select('step_number')
    .eq('document_id', documentId)
    .order('step_number', { ascending: false })
    .limit(1);

  const nextStepNumber = (steps && steps.length > 0) ? steps[0].step_number + 1 : 1;

  // 3. Insert new routing step
  const { data: newStep, error: insertErr } = await supabase
    .from('document_routing')
    .insert({
      document_id: documentId,
      step_number: nextStepNumber,
      sender_user_id: senderId,
      receiver_user_id: receiverId,
      receiver_department_id: receiverDeptId,
      status: 'pending',
      comment: null
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  // 4. Update document's current recipient list (for visibility)
  const { data: doc } = await supabase
    .from('documents')
    .select('recipients')
    .eq('id', documentId)
    .single();

  const currentRecipients = doc?.recipients || [];
  if (!currentRecipients.includes(receiverEmail)) {
    await supabase
      .from('documents')
      .update({
        recipients: [...currentRecipients, receiverEmail],
        status: 'forwarded',
        updated_at: now
      })
      .eq('id', documentId);
  } else {
    await supabase
      .from('documents')
      .update({
        status: 'forwarded',
        updated_at: now
      })
      .eq('id', documentId);
  }

  // 5. Audit Trail
  await supabase.from('document_audit_trail').insert({
    document_id: documentId,
    action_by: senderId,
    action_type: 'forwarded',
    comment: finalComment
  });

  // 6. Notify legacy history
  await supabase.from('document_history').insert({
    document_id: documentId,
    status: 'forwarded',
    comment: finalComment,
    updated_by: senderName
  });
}
