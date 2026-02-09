import { useParams, Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Mail, Loader2 } from 'lucide-react';
import { DocumentStatus, type TeamMember, type TeamRole } from '../types';
import { getStatusLabel } from '../lib/format';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';
import { EmailChipInput } from './email-chip-input';

const ROLE_BADGE_STYLE: Record<TeamRole, string> = {
  admin: 'bg-violet-500/20 text-violet-700 dark:text-violet-400',
  manager: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  member: 'bg-slate-500/20 text-slate-700 dark:text-slate-400',
};

export function TeamDocuments() {
  const { teamId } = useParams();
  const location = useLocation();
  const { documents: allDocuments, teams, fetchTeamMembers, searchQuery, currentUserId, addTeamMemberByEmail, refreshTeams } = useApp();
  const team = teamId ? teams.find((t) => t.id === teamId) : null;
  const isTeamOwner = Boolean(team && currentUserId && team.createdBy === currentUserId);
  const baseDocuments = teamId
    ? allDocuments
        .filter((d) => d.teamId === teamId)
        .filter((d) => documentMatchesSearch(d, searchQuery))
    : [];
  type StatusTab = 'all' | 'pending' | 'signed' | 'rejected';
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const documents = baseDocuments.filter((doc) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'pending') return doc.status === 'under-review';
    if (statusTab === 'signed') return doc.status === 'approved';
    if (statusTab === 'rejected') return doc.status === 'rejected';
    return true;
  });
  const teamName = team?.name ?? 'Team';
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<'manager' | 'member'>('member');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const INVITE_ROLES: { value: 'manager' | 'member'; label: string }[] = [
    { value: 'member', label: 'Member' },
    { value: 'manager', label: 'Manager' },
  ];

  useEffect(() => {
    if (!teamId || !fetchTeamMembers) return;
    fetchTeamMembers(teamId).then(setMembers).catch(() => setMembers([]));
  }, [teamId, fetchTeamMembers]);

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || inviteEmails.length === 0 || isInviting) return;
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
        const updated = await fetchTeamMembers(teamId);
        setMembers(updated);
        await refreshTeams();
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

  const getFileIcon = (fileType: string) => {
    const iconClass = 'size-5';
    switch (fileType) {
      case 'PDF':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'XLSX':
        return <FileText className={`${iconClass} text-green-600`} />;
      case 'DOC':
      case 'DOCX':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'IMG':
        return <FileText className={`${iconClass} text-purple-600`} />;
      default:
        return <FileText className={`${iconClass} text-slate-600`} />;
    }
  };

  const getFileIconBg = (fileType: string) => {
    switch (fileType) {
      case 'PDF': return 'bg-red-500/15';
      case 'XLSX': return 'bg-green-500/15';
      case 'DOC':
      case 'DOCX': return 'bg-blue-500/15';
      case 'IMG': return 'bg-purple-500/15';
      default: return 'bg-slate-500/15';
    }
  };

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400">
            <CheckCircle className="size-3" />
            Approved
          </span>
        );
      case 'under-review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <Clock className="size-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-700 dark:text-red-400">
            <AlertTriangle className="size-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium opacity-90" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
            {getStatusLabel(status)}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!teamId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-96">
          <FileText className="size-16 mb-4" style={mutedStyle} />
          <h2 className="text-xl font-semibold mb-2" style={textStyle}>Team not found</h2>
          <p style={mutedStyle}>This team may have been removed or you don’t have access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>{teamName}</h1>
        <p className="mt-1" style={mutedStyle}>
          {documents.length === 0
            ? 'No documents shared with this team yet. Upload a document and choose this team to share.'
            : 'Documents shared with this team'}
        </p>
      </div>

      {isTeamOwner && (
        <div className="rounded-xl border p-6" style={cardStyle}>
          <h2 className="text-lg font-medium mb-2 flex items-center gap-2" style={textStyle}>
            <Mail className="size-5" style={mutedStyle} />
            Add members
          </h2>
          <p className="text-sm mb-4" style={mutedStyle}>
            Add members by email. Press Enter after each email to add another, then click Add members.
          </p>
          {inviteError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-800 dark:text-red-300 text-sm">
              {inviteError}
            </div>
          )}
          <form onSubmit={handleAddMembers} className="space-y-4">
            <div className="w-full min-w-0">
              <label htmlFor="team-add-emails" className="sr-only">Add members by email</label>
              <EmailChipInput
                id="team-add-emails"
                emails={inviteEmails}
                onChange={setInviteEmails}
                placeholder="Add email, press Enter to add another"
                disabled={isInviting}
                className="w-full min-w-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'manager' | 'member')}
                className="px-3 py-2 rounded-lg border text-sm h-[42px] shrink-0"
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                disabled={isInviting}
                title="Role for new members"
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isInviting || inviteEmails.length === 0}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 h-[42px] shrink-0"
              >
                {isInviting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                {isInviting ? 'Adding...' : inviteEmails.length > 1 ? `Add ${inviteEmails.length} members` : 'Add member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {members.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={cardStyle}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <Users className="size-5" style={mutedStyle} />
            <h2 className="text-lg font-medium" style={textStyle}>Team members</h2>
          </div>
          <ul className="divide-y p-2" style={{ borderColor: 'var(--border)' }}>
            {members.map((m) => (
              <li key={m.id} className="px-4 py-2 flex items-center justify-between gap-4 flex-wrap" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={textStyle}>{m.displayName || m.email || 'Unknown'}</span>
                  {m.email && <span className="text-sm" style={mutedStyle}>{m.email}</span>}
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium capitalize ${ROLE_BADGE_STYLE[m.role]}`}>
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {baseDocuments.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={cardStyle}>
          <FileText className="size-16 mx-auto mb-4" style={mutedStyle} />
          <h3 className="text-lg font-medium mb-2" style={textStyle}>No documents yet</h3>
          <p style={mutedStyle}>When you upload a document and select “{teamName}” as the team, it will appear here.</p>
        </div>
      ) : (

      <div className="rounded-xl border" style={cardStyle}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'signed', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusTab(tab)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      statusTab === tab ? 'bg-blue-600 text-white' : 'hover:opacity-90'
                    }`}
                    style={statusTab === tab ? undefined : { color: 'var(--foreground)' }}
                  >
                    {tab === 'all' ? 'All' : tab === 'signed' ? 'Signed' : tab === 'pending' ? 'Pending' : 'Rejected'}
                  </button>
                ))}
              </div>
              <p className="text-sm" style={mutedStyle}>
                <span className="font-medium" style={textStyle}>{documents.length}</span> documents in this team
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={mutedBgStyle}>
                <tr>
                  {['Document Name', 'Category', 'Tracking ID', 'Last Updated', 'Owner', 'Status'].map((label) => (
                    <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={mutedStyle}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {documents.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg`}>
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/documents/${doc.id}`}
                            state={{ from: location.pathname }}
                            className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                            style={textStyle}
                            title={doc.title}
                          >
                            {doc.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <DocumentSourceBadge document={doc} currentUserId={currentUserId} teams={teams} />
                          </div>
                          <p className="text-xs mt-0.5" style={mutedStyle}>
                            {doc.fileType} • {doc.fileSize}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={mutedBgStyle}>
                        <span style={textStyle}>{doc.category}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={mutedStyle}>{doc.trackingId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={mutedStyle}>{formatDate(doc.updatedAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {getInitials(doc.ownerName)}
                        </div>
                        <span className="text-sm" style={textStyle}>{doc.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
