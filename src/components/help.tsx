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
      answer: 'Open the document and use "Share with team" to make it visible to a team. Team members can view the document, add comments, and export PDF. Only the document owner can update status, delete, or change sharing.',
      category: 'Collaboration',
    },
    {
      question: 'Who can delete or modify a document?',
      answer: 'Only the document creator (owner) can delete it or update its status. Team members can view the document, add comments, and export PDF. This keeps the system secure and consistent.',
      category: 'Document Management',
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

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium mb-2 hover:opacity-80 transition-opacity"
          style={mutedStyle}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold" style={textStyle}>Help & Support</h1>
        <p className="mt-1" style={mutedStyle}>Find answers to common questions and get support</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5" style={mutedStyle} />
        <input
          type="text"
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={inputStyle}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 border rounded-xl hover:shadow-md transition-all text-left group" style={cardStyle}>
          <div className="p-3 bg-blue-500/15 rounded-lg w-fit mb-4 group-hover:bg-blue-500/25 transition-colors">
            <FileText className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold mb-1" style={textStyle}>Documentation</h3>
          <p className="text-sm" style={mutedStyle}>Read our comprehensive guides</p>
        </button>

        <button className="p-6 border rounded-xl hover:shadow-md transition-all text-left group" style={cardStyle}>
          <div className="p-3 bg-green-500/15 rounded-lg w-fit mb-4 group-hover:bg-green-500/25 transition-colors">
            <MessageCircle className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold mb-1" style={textStyle}>Live Chat</h3>
          <p className="text-sm" style={mutedStyle}>Chat with our support team</p>
        </button>

        <button className="p-6 border rounded-xl hover:shadow-md transition-all text-left group" style={cardStyle}>
          <div className="p-3 bg-purple-500/15 rounded-lg w-fit mb-4 group-hover:bg-purple-500/25 transition-colors">
            <Mail className="size-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold mb-1" style={textStyle}>Email Support</h3>
          <p className="text-sm" style={mutedStyle}>Send us an email</p>
        </button>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={textStyle}>Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className="flex items-center justify-between p-4 border rounded-lg transition-colors text-left hover:opacity-90"
                style={cardStyle}
              >
                <span className="font-medium" style={textStyle}>{category}</span>
                <ChevronRight className="size-5" style={mutedStyle} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>
          {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={cardStyle}>
              <HelpCircle className="mx-auto size-12 mb-3" style={mutedStyle} />
              <p style={mutedStyle}>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <details
                key={index}
                className="rounded-xl border overflow-hidden group"
                style={cardStyle}
              >
                <summary className="p-4 cursor-pointer transition-colors flex items-center justify-between hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium" style={textStyle}>{faq.question}</h3>
                        <span className="inline-block mt-1 text-xs px-2 py-1 rounded" style={mutedBgStyle}>
                          <span style={textStyle}>{faq.category}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 group-open:rotate-90 transition-transform" style={mutedStyle} />
                </summary>
                <div className="px-4 pb-4 pl-12 text-sm pt-4 border-t" style={{ ...mutedStyle, borderColor: 'var(--border)' }}>
                  {faq.answer}
                </div>
              </details>
            ))
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-xl p-6 border bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg shadow-sm bg-blue-500/15">
            <MessageCircle className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={textStyle}>Still need help?</h3>
            <p className="text-sm mb-4" style={mutedStyle}>
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
