import { supabase } from '../lib/supabase';
import type { Team, TeamMember } from '../types';

export async function fetchMyTeams(userId: string): Promise<Team[]> {
  const { data: memberRows, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);
  if (memberError) throw memberError;
  const teamIds = (memberRows || []).map((r) => r.team_id);
  if (teamIds.length === 0) return [];

  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, created_by, created_at')
    .in('id', teamIds)
    .order('name');
  if (teamsError) throw teamsError;

  const teams = (teamsData || []).map((t) => ({
    id: t.id,
    name: t.name,
    createdBy: t.created_by,
    createdAt: t.created_at,
  }));

  const { data: countData } = await supabase
    .from('team_members')
    .select('team_id')
    .in('team_id', teamIds);
  const countByTeam: Record<string, number> = {};
  (countData || []).forEach((r: { team_id: string }) => {
    countByTeam[r.team_id] = (countByTeam[r.team_id] || 0) + 1;
  });
  return teams.map((t) => ({ ...t, memberCount: countByTeam[t.id] ?? 0 }));
}

export async function getMyTeamIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r) => r.team_id);
}

/** Create a team via RPC (bypasses RLS; server sets created_by = auth.uid() and adds you as admin). */
export async function createTeam(name: string, _ownerUserId: string): Promise<Team> {
  const { data, error } = await supabase.rpc('create_team', { p_name: name.trim() });
  if (error) {
    const msg = error.message || String(error);
    throw new Error(msg);
  }
  if (!data || typeof data !== 'object') {
    throw new Error('Create team did not return data');
  }
  const row = data as { id: string; name: string; created_by: string; created_at: string };
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    memberCount: 1,
  };
}

export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data: rows, error } = await supabase
    .from('team_members')
    .select('id, team_id, user_id, role, created_at')
    .eq('team_id', teamId)
    .order('created_at');
  if (error) throw error;
  if (!rows?.length) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .in('id', userIds);
  const profileById = new Map(
    (profiles || []).map((p: { id: string; email: string | null; display_name: string | null }) => [p.id, p])
  );

  return rows.map((row) => {
    const p = profileById.get(row.user_id);
    return {
      id: row.id,
      teamId: row.team_id,
      userId: row.user_id,
      email: p?.email ?? null,
      displayName: p?.display_name ?? null,
      role: (row.role === 'owner' ? 'admin' : row.role) as 'admin' | 'manager' | 'member',
      createdAt: row.created_at,
    };
  });
}

/** Role to assign when adding a new member (admin is only for the team creator). */
export type InviteRole = 'manager' | 'member';

/** Add a member by email with the given role. Invited user must have a profile. Caller must be admin or manager. */
export async function addTeamMemberByEmail(
  teamId: string,
  email: string,
  role: InviteRole,
  _inviterUserId: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Email is required');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', normalizedEmail)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile?.id) throw new Error('No user found with that email. They need to sign up first.');

  const { error: insertError } = await supabase.from('team_members').insert({
    team_id: teamId,
    user_id: profile.id,
    role,
  });
  if (insertError) {
    if (insertError.code === '23505') throw new Error('This user is already in the team.');
    throw insertError;
  }
}

export async function removeTeamMember(teamId: string, userIdToRemove: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userIdToRemove);
  if (error) throw error;
}

export async function leaveTeam(teamId: string, userId: string): Promise<void> {
  await removeTeamMember(teamId, userId);
}
