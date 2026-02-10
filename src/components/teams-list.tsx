import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Users, Plus, Loader2, ArrowRight, Mail, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { TEAM_ROLE_DESCRIPTIONS, TEAM_ROLE_LABELS, type TeamRole } from '../types';
import { EmailChipInput } from './email-chip-input';

const TEAM_COLORS = ['bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-amber-500'];

const INVITE_ROLES: { value: 'manager' | 'member'; label: string }[] = [
  { value: 'member', label: 'Member' },
  { value: 'manager', label: 'Manager' },
];

function canManageMembers(team: { currentUserRole?: import('../types').TeamRole }): boolean {
  return team.currentUserRole === 'admin' || team.currentUserRole === 'manager';
}

export function TeamsList() {
  const navigate = useNavigate();
  const { teams, createTeam, addTeamMemberByEmail, refreshTeams } = useApp();
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<'manager' | 'member'>('member');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showRoleGuide, setShowRoleGuide] = useState(false);

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name || isCreating) return;
    setIsCreating(true);
    setInviteError('');
    try {
      const team = await createTeam(name);
      setNewTeamName('');
      navigate(`/teams/${team.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : (err && typeof (err as { message?: string }).message === 'string' ? (err as { message: string }).message : 'Failed to create team');
      setInviteError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent, teamId: string) => {
    e.preventDefault();
    if (inviteEmails.length === 0 || isInviting) return;
    setIsInviting(true);
    setInviteError('');
    const failed: string[] = [];
    try {
      for (const email of inviteEmails) {
        try {
          await addTeamMemberByEmail(teamId, email, inviteRole);
        } catch {
          failed.push(email);
        }
      }
      if (failed.length === 0) {
        setInviteEmails([]);
        setInviteTeamId(null);
      } else {
        setInviteError(failed.length === inviteEmails.length ? 'Failed to add members' : `Could not add: ${failed.join(', ')}`);
        setInviteEmails(failed);
      }
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to add members');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>Teams</h1>
        <p className="mt-1" style={mutedStyle}>
          Create teams and invite members; the creator is the Admin. Assign roles when you add people.
        </p>
        <button
          type="button"
          onClick={() => setShowRoleGuide(!showRoleGuide)}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-90"
          style={mutedStyle}
        >
          <Info className="size-4" />
          {showRoleGuide ? 'Hide' : 'Show'} role guide
        </button>
        {showRoleGuide && (
          <div className="mt-3 p-4 rounded-lg border space-y-2" style={{ ...cardStyle, borderColor: 'var(--border)' }}>
            {(['admin', 'manager', 'member'] as TeamRole[]).map((role) => (
              <div key={role}>
                <span className="font-medium" style={textStyle}>{TEAM_ROLE_LABELS[role]}</span>
                <p className="text-sm mt-0.5" style={mutedStyle}>{TEAM_ROLE_DESCRIPTIONS[role]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border p-6" style={cardStyle}>
        <h2 className="text-lg font-medium mb-3" style={textStyle}>Create a team</h2>
        <p className="text-sm mb-3" style={mutedStyle}>
          Enter a team name below, then click Create team.
        </p>
        <form onSubmit={handleCreateTeam} className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="new-team-name" className="sr-only">Team name</label>
            <input
              id="new-team-name"
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Legal, Finance, Marketing"
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={inputStyle}
              disabled={isCreating}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!newTeamName.trim() || isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] shrink-0"
            title={!newTeamName.trim() ? 'Enter a team name first' : undefined}
          >
            {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isCreating ? 'Creating...' : 'Create team'}
          </button>
        </form>
      </div>

      {inviteError && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-800 dark:text-red-300 text-sm space-y-1">
          <p>{inviteError}</p>
          {(inviteError.includes('relation') || inviteError.includes('does not exist') || inviteError.includes('column') || inviteError.includes('violates')) && (
            <p className="mt-2 opacity-90">
              Make sure you’ve run the Supabase migrations: <code className="bg-black/10 dark:bg-white/10 px-1 rounded">add-teams-and-shared-documents.sql</code> and <code className="bg-black/10 dark:bg-white/10 px-1 rounded">refine-team-roles.sql</code> in the SQL Editor.
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-medium" style={textStyle}>My teams</h2>
          <p className="text-sm mt-0.5" style={mutedStyle}>
            {teams.length === 0
              ? 'Create a team above, then add members so they can see documents you share with the team.'
              : 'Click a team to view its documents, or add members by email.'}
          </p>
        </div>
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {teams.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <Users className="mx-auto size-12 mb-3" style={mutedStyle} />
              <p style={mutedStyle}>No teams yet</p>
            </li>
          ) : (
            teams.map((team, i) => (
              <li key={team.id} className="px-6 py-4 flex flex-wrap items-center gap-4 justify-between" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${TEAM_COLORS[i % TEAM_COLORS.length]}`}>
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium" style={textStyle}>{team.name}</p>
                    <p className="text-sm flex items-center gap-2" style={mutedStyle}>
                      <span>{team.memberCount ?? 0} member{(team.memberCount ?? 0) !== 1 ? 's' : ''}</span>
                      {team.currentUserRole && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-violet-500/15 text-violet-700 dark:text-violet-400">
                          You: {TEAM_ROLE_LABELS[team.currentUserRole]}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {canManageMembers(team) && inviteTeamId === team.id ? (
                    <form
                      onSubmit={(e) => handleInvite(e, team.id)}
                      className="space-y-3 w-full min-w-0"
                    >
                      <div className="w-full min-w-0">
                        <label htmlFor={`invite-emails-${team.id}`} className="sr-only">Add members by email</label>
                        <EmailChipInput
                          id={`invite-emails-${team.id}`}
                          emails={inviteEmails}
                          onChange={setInviteEmails}
                          placeholder="Add email, press Enter to add another"
                          disabled={isInviting}
                          className="w-full min-w-0"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as 'manager' | 'member')}
                          className="pl-3 pr-8 py-2 rounded-lg border text-sm h-[42px] shrink-0"
                          style={inputStyle}
                          disabled={isInviting}
                          title="Role for new members"
                        >
                          {INVITE_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        <button type="submit" disabled={isInviting || inviteEmails.length === 0} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 h-[42px] shrink-0">
                          {isInviting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                          {isInviting ? 'Adding...' : inviteEmails.length > 1 ? `Add ${inviteEmails.length} members` : 'Add member'}
                        </button>
                        <button type="button" onClick={() => { setInviteTeamId(null); setInviteEmails([]); setInviteError(''); }} className="text-sm py-2 shrink-0" style={mutedStyle}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {canManageMembers(team) && (
                        <button
                          type="button"
                          onClick={() => setInviteTeamId(team.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border hover:opacity-90"
                          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        >
                          <Mail className="size-4" />
                          Add member
                        </button>
                      )}
                      <Link
                        to={`/teams/${team.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:opacity-90"
                      >
                        View documents
                        <ArrowRight className="size-4" />
                      </Link>
                    </>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
