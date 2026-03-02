import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  mobile_number: string | null;
  avatar_url: string | null;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, mobile_number, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'email' | 'mobile_number' | 'avatar_url'>>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}
