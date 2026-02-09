import { Link } from 'react-router';
import { draftDocuments } from '../data/categorizedData';
import { FileText, Edit, Trash2 } from 'lucide-react';

export function Drafts() {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Draft Documents</h1>
        <p className="mt-1 text-slate-600">Documents you're currently working on</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              You have <span className="font-medium text-slate-900">{draftDocuments.length}</span> draft documents
            </p>
            <Link
              to="/upload"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Create New Draft
            </Link>
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
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {draftDocuments.map((doc) => (
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
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit className="size-4" />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
