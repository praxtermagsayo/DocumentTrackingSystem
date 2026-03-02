import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  HelpCircle,
  Search,
  FileText,
  MessageCircle,
  Mail,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I upload a new document?',
      answer: 'Click the "Upload New" button in the top right corner, select your file, fill in the required information, and click submit.',
      category: 'Getting Started',
    },
    {
      question: 'How can I track the status of my documents?',
      answer: 'Navigate to the Dashboard or My Documents section to see all your documents and their current status. Each document has a status badge indicating its current state.',
      category: 'Document Management',
    },
    {
      question: 'What file types are supported?',
      answer: 'DocTrack supports PDF, DOC, DOCX, XLSX, and various image formats. Maximum file size is 50MB per document.',
      category: 'Getting Started',
    },
    {
      question: 'How do I share a document with team members?',
      answer: 'Open the document, click the "Share Document" button, enter email addresses of team members, and set their permissions.',
      category: 'Collaboration',
    },
    {
      question: 'Can I export documents to PDF?',
      answer: 'Yes, open any document and click the "Export PDF" button in the Quick Actions panel to download a PDF version.',
      category: 'Document Management',
    },
    {
      question: 'How do I change my notification settings?',
      answer: 'Go to Settings > Notifications and toggle the notification preferences according to your needs.',
      category: 'Settings',
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">Help & Support</h1>
        <p className="mt-1 text-slate-600">Find answers to common questions and get support</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-left group">
          <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4 group-hover:bg-blue-100 transition-colors">
            <FileText className="size-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Documentation</h3>
          <p className="text-sm text-slate-600">Read our comprehensive guides</p>
        </button>

        <button className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-left group">
          <div className="p-3 bg-green-50 rounded-lg w-fit mb-4 group-hover:bg-green-100 transition-colors">
            <MessageCircle className="size-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Live Chat</h3>
          <p className="text-sm text-slate-600">Chat with our support team</p>
        </button>

        <button className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-left group">
          <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4 group-hover:bg-purple-100 transition-colors">
            <Mail className="size-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Email Support</h3>
          <p className="text-sm text-slate-600">Send us an email</p>
        </button>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <span className="font-medium text-slate-900">{category}</span>
                <ChevronRight className="size-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <HelpCircle className="mx-auto size-12 text-slate-300 mb-3" />
              <p className="text-slate-600">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <details
                key={index}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden group"
              >
                <summary className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-slate-900">{faq.question}</h3>
                        <span className="inline-block mt-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 pl-12 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <MessageCircle className="size-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Still need help?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Our support team is available 24/7 to assist you with any questions or issues.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Contact Support
              <ExternalLink className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
