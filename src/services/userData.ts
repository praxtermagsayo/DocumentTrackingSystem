import { supabase } from '../lib/supabase';
import * as documentService from './documents';
import * as notificationService from './notifications';
import * as activityService from './activities';
import * as eventCategoryService from './eventCategories';

const BUCKET = 'documents';

export interface ExportData {
  exportedAt: string;
  profile: Record<string, unknown> | null;
  documents: unknown[];
  documentHistory: Record<string, unknown[]>;
  notifications: unknown[];
  eventCategories: unknown[];
  activities: unknown[];
}

export async function exportAllUserData(userId: string): Promise<ExportData> {
  const [profileRes, docsRes, notifRes, catsRes, actsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    documentService.fetchDocuments(userId),
    notificationService.fetchNotifications(userId),
    eventCategoryService.fetchEventCategories(userId),
    activityService.fetchActivities(userId),
  ]);

  const profile = profileRes.data as Record<string, unknown> | null;
  const documents = docsRes.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status,
    category: d.category,
    trackingId: d.trackingId,
    createdBy: d.createdBy,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    fileType: d.fileType,
    fileSize: d.fileSize,
  }));

  const documentHistory: Record<string, unknown[]> = {};
  for (const doc of docsRes) {
    try {
      const history = await documentService.fetchDocumentHistory(doc.id);
      documentHistory[doc.id] = history;
    } catch {
      documentHistory[doc.id] = [];
    }
  }

  const notifications = notifRes.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    timestamp: n.timestamp,
    link: n.link,
  }));

  const eventCategories = catsRes.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    createdAt: c.createdAt,
  }));

  const activities = actsRes.map((a) => ({
    id: a.id,
    postDate: a.postDate,
    eventStart: a.eventStart,
    eventEnd: a.eventEnd,
    categoryId: a.categoryId,
    description: a.description,
    createdAt: a.createdAt,
  }));

  return {
    exportedAt: new Date().toISOString(),
    profile,
    documents,
    documentHistory,
    notifications,
    eventCategories,
    activities,
  };
}

export async function deleteAllUserData(userId: string): Promise<void> {
  // 1. Get all user documents with file paths for storage cleanup
  const { data: docs } = await supabase
    .from('documents')
    .select('id, file_path')
    .eq('user_id', userId);

  const filePaths: string[] = [];
  for (const doc of docs || []) {
    if (doc?.file_path) {
      filePaths.push(doc.file_path);
    }
  }

  // 2. Remove files from storage (batch in chunks of 100)
  if (filePaths.length > 0) {
    for (let i = 0; i < filePaths.length; i += 100) {
      const chunk = filePaths.slice(i, i + 100);
      await supabase.storage.from(BUCKET).remove(chunk);
    }
  }

  // 3. Delete activities (references event_categories)
  await supabase.from('activities').delete().eq('user_id', userId);

  // 4. Delete event categories
  await supabase.from('event_categories').delete().eq('created_by', userId);

  // 5. Delete document history and documents
  const docIds = (docs || []).map((d) => d.id);
  if (docIds.length > 0) {
    await supabase.from('document_history').delete().in('document_id', docIds);
  }
  await supabase.from('documents').delete().eq('user_id', userId);

  // 6. Delete notifications
  await supabase.from('notifications').delete().eq('user_id', userId);

  // 7. Delete profile
  await supabase.from('profiles').delete().eq('id', userId);
}

/**
 * Delete the auth user via Edge Function. Call this AFTER deleteAllUserData, but pass the token fetched BEFORE deleteAllUserData.
 * Uses raw fetch to avoid Supabase client invoke issues that can cause "Failed to fetch".
 */
export async function deleteAuthUser(token: string): Promise<void> {

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!baseUrl || !apikey) {
    throw new Error('Missing Supabase configuration.');
  }

  const url = `${baseUrl}/functions/v1/delete-user`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey,
      },
      body: JSON.stringify({}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Request failed';
    throw new Error(
      `${msg}. Ensure the delete-user Edge Function is deployed: supabase functions deploy delete-user`
    );
  }

  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json?.error ?? `Delete failed (${res.status})`);
  }
  if (json?.error) {
    throw new Error(json.error);
  }
}
