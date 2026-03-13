import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  mobile_number: string | null;
  avatar_url: string | null;
  department_id: string | null;
  departments?: {
    name: string;
    code: string;
  } | null;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, 
      email, 
      display_name, 
      mobile_number, 
      avatar_url, 
      department_id,
      departments:department_id (
        name,
        code
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as any as Profile;
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
