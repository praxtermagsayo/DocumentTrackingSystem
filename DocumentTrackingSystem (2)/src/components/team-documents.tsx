import { useParams, Link } from 'react-router';
import { teamDocuments } from '../data/categorizedData';
import { FileText, Clock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { DocumentStatus } from '../types';

export function TeamDocuments() {
  const { teamId } = useParams();
  const documents = teamDocuments[teamId || ''] || [];

  const teamNames: Record<string, string> = {
    'legal': 'Legal Department',
    'finance': 'Finance Team',
    'hr': 'HR & Admin'
  };

  const teamColors: Record<string, string> = {
    'legal': 'orange',
    'finance': 'green',
    'hr': 'purple'
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
      case 'PDF':
        return 'bg-red-50';
      case 'XLSX':
        return 'bg-green-50';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-50';
      case 'IMG':
        return 'bg-purple-50';
      default:
        return 'bg-slate-50';
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle className="size-3" />
            Approved
          </span>
        );
      case 'under-review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
            <Clock className="size-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
            <AlertTriangle className="size-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700">
            {status}
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

  if (!teamId || !documents.length) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-96">
          <FileText className="size-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Documents Found</h2>
          <p className="text-slate-600">This team doesn't have any documents yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-${teamColors[teamId]}-500`} />
          <h1 className="text-2xl font-semibold text-slate-900">{teamNames[teamId]}</h1>
        </div>
        <p className="mt-1 text-slate-600">Team documents and shared files</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{documents.length}</span> documents in this team
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tracking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg`}>
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div>
                        <Link
                          to={`/documents/${doc.id}`}
                          className="text-sm font-medium text-slate-900 hover:text-blue-600"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {doc.fileType} • {doc.fileSize}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{doc.trackingId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{formatDate(doc.updatedAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {getInitials(doc.ownerName)}
                      </div>
                      <span className="text-sm text-slate-900">{doc.ownerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
