import { supabase } from '../lib/supabase';
import type { Activity } from '../types';

export interface ActivityRow {
  id: string;
  user_id: string;
  post_date: string;
  event_start: string;
  event_end: string;
  category_id: string;
  description: string | null;
  created_at: string;
}

export interface ActivityWithCategory extends ActivityRow {
  event_categories?: { name: string } | null;
  profiles?: { display_name: string } | null;
}

function rowToActivity(row: ActivityWithCategory): Activity {
  return {
    id: row.id,
    userId: row.user_id,
    postDate: row.post_date,
    eventStart: row.event_start,
    eventEnd: row.event_end,
    categoryId: row.category_id,
    categoryName: row.event_categories?.name,
    description: row.description || '',
    creatorName: row.profiles?.display_name || 'Unknown User',
    createdAt: row.created_at,
  };
}

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*, event_categories(name), profiles(display_name)')
    .order('event_start', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => rowToActivity(row as ActivityWithCategory));
}

export async function createActivity(params: {
  userId: string;
  postDate: string;
  eventStart: string;
  eventEnd: string;
  categoryId: string;
  description: string;
}): Promise<Activity> {
  const { userId, postDate, eventStart, eventEnd, categoryId, description } = params;
  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      post_date: postDate,
      event_start: eventStart,
      event_end: eventEnd,
      category_id: categoryId,
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToActivity(data as ActivityWithCategory);
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}
