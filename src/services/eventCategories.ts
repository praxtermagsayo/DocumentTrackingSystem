import { supabase } from '../lib/supabase';
import type { EventCategory, EventCategoryStatus } from '../types';

export interface EventCategoryRow {
  id: string;
  name: string;
  status: string;
  created_by: string;
  created_at: string;
  profiles?: { display_name: string } | null;
}

function rowToCategory(row: EventCategoryRow): EventCategory {
  return {
    id: row.id,
    name: row.name,
    status: row.status as EventCategoryStatus,
    createdBy: row.created_by,
    creatorName: row.profiles?.display_name || 'Unknown User',
    createdAt: row.created_at,
  };
}

export async function fetchEventCategories(): Promise<EventCategory[]> {
  const { data, error } = await supabase
    .from('event_categories')
    .select('*, profiles(display_name)')
    .order('name');

  if (error) throw error;
  return (data || []).map((row) => rowToCategory(row as EventCategoryRow));
}

export async function createEventCategory(
  userId: string,
  name: string,
  status: EventCategoryStatus
): Promise<EventCategory> {
  const { data, error } = await supabase
    .from('event_categories')
    .insert({
      name: name.trim(),
      status,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToCategory(data as EventCategoryRow);
}

export async function updateEventCategory(
  id: string,
  name: string,
  status: EventCategoryStatus
): Promise<void> {
  const { error } = await supabase
    .from('event_categories')
    .update({ name: name.trim(), status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEventCategory(id: string): Promise<void> {
  const { error } = await supabase.from('event_categories').delete().eq('id', id);
  if (error) throw error;
}
