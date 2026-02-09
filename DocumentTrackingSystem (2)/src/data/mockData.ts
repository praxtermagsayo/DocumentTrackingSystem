import { Document, DocumentHistory } from '../types';

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Service_Agreement_v2.pdf',
    description: 'Comprehensive financial analysis for the fourth quarter',
    status: 'under-review',
    category: 'Legal',
    createdBy: 'Sarah Wilson',
    createdAt: '2023-10-20T10:30:00Z',
    updatedAt: '2023-10-24T14:20:00Z',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    trackingId: '#TRK-2024-001',
    ownerName: 'Sarah Wilson'
  },
  {
    id: '2',
    title: 'Q4_Financial_Report.xlsx',
    description: 'Updated policies and procedures for 2026',
    status: 'approved',
    category: 'Finance',
    createdBy: 'Michael Chen',
    createdAt: '2023-10-19T09:15:00Z',
    updatedAt: '2023-10-23T11:45:00Z',
    fileType: 'XLSX',
    fileSize: '2.3 MB',
    trackingId: '#TRK-2024-002',
    ownerName: 'Michael Chen'
  },
  {
    id: '3',
    title: 'Employee_Handbook_Update.docx',
    description: 'Proposed marketing initiatives for Q1 2026',
    status: 'approved',
    category: 'HR',
    createdBy: 'Emily Davis',
    createdAt: '2023-10-18T13:00:00Z',
    updatedAt: '2023-10-22T16:30:00Z',
    fileType: 'DOC',
    fileSize: '2.4 MB',
    trackingId: '#TRK-2024-003',
    ownerName: 'Emily Davis'
  },
  {
    id: '4',
    title: 'Project_Alpha_Specs.pdf',
    description: 'Terms and conditions for enterprise software licensing',
    status: 'rejected',
    category: 'Engineering',
    createdBy: 'David Miller',
    createdAt: '2023-10-17T08:45:00Z',
    updatedAt: '2023-10-21T10:15:00Z',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    trackingId: '#TRK-2024-004',
    ownerName: 'David Miller'
  },
  {
    id: '5',
    title: 'Marketing_Assets_Bundle.zip',
    description: 'Detailed timeline and milestones for website overhaul',
    status: 'under-review',
    category: 'Marketing',
    createdBy: 'Jessica Taylor',
    createdAt: '2023-10-16T14:20:00Z',
    updatedAt: '2023-10-20T09:30:00Z',
    fileType: 'IMG',
    fileSize: '2.3 MB',
    trackingId: '#TRK-2024-005',
    ownerName: 'Jessica Taylor'
  },
  {
    id: '6',
    title: 'Vendor_Contract_Global.pdf',
    description: 'Annual compliance audit results',
    status: 'approved',
    category: 'Legal',
    createdBy: 'James Wilson',
    createdAt: '2023-10-15T11:00:00Z',
    updatedAt: '2023-10-19T15:45:00Z',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    trackingId: '#TRK-2024-006',
    ownerName: 'James Wilson'
  },
  {
    id: '7',
    title: 'Training Materials - Cybersecurity',
    description: 'Updated training content for security awareness',
    status: 'approved',
    category: 'Training',
    createdBy: 'Rachel Kim',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-26T13:20:00Z',
    fileType: 'PDF',
    fileSize: '4.5 MB',
    trackingId: '#TRK-2024-007',
    ownerName: 'Rachel Kim'
  },
  {
    id: '8',
    title: 'Vendor Contract - Office Supplies',
    description: 'Annual contract renewal with office supply vendor',
    status: 'draft',
    category: 'Procurement',
    createdBy: 'Tom Martinez',
    createdAt: '2026-02-02T15:30:00Z',
    updatedAt: '2026-02-03T10:15:00Z',
    fileType: 'DOCX',
    fileSize: '523 KB',
    trackingId: '#TRK-2024-008',
    ownerName: 'Tom Martinez'
  },
  {
    id: '9',
    title: 'IT Infrastructure Upgrade Plan',
    description: 'Proposed infrastructure improvements for 2026',
    status: 'under-review',
    category: 'IT',
    createdBy: 'Alex Thompson',
    createdAt: '2026-01-25T09:45:00Z',
    updatedAt: '2026-02-01T14:00:00Z',
    fileType: 'PDF',
    fileSize: '2.9 MB',
    trackingId: '#TRK-2024-009',
    ownerName: 'Alex Thompson'
  },
  {
    id: '10',
    title: 'Customer Satisfaction Survey Results',
    description: 'Analysis of Q4 2025 customer feedback',
    status: 'archived',
    category: 'Customer Service',
    createdBy: 'Nina Patel',
    createdAt: '2025-12-20T11:30:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    fileType: 'XLSX',
    fileSize: '1.4 MB',
    trackingId: '#TRK-2024-010',
    ownerName: 'Nina Patel'
  }
];

export const mockHistory: Record<string, DocumentHistory[]> = {
  '1': [
    {
      id: 'h1',
      documentId: '1',
      status: 'draft',
      comment: 'Initial document created',
      updatedBy: 'Sarah Johnson',
      timestamp: '2026-01-15T10:30:00Z'
    },
    {
      id: 'h2',
      documentId: '1',
      status: 'under-review',
      comment: 'Submitted for review to finance team',
      updatedBy: 'Sarah Johnson',
      timestamp: '2026-01-20T14:15:00Z'
    },
    {
      id: 'h3',
      documentId: '1',
      status: 'approved',
      comment: 'Approved by CFO - all figures verified',
      updatedBy: 'Robert Chen',
      timestamp: '2026-01-28T14:20:00Z'
    }
  ],
  '2': [
    {
      id: 'h4',
      documentId: '2',
      status: 'draft',
      comment: 'Initial draft prepared',
      updatedBy: 'Michael Chen',
      timestamp: '2026-01-20T09:15:00Z'
    },
    {
      id: 'h5',
      documentId: '2',
      status: 'under-review',
      comment: 'Sent to HR director for approval',
      updatedBy: 'Michael Chen',
      timestamp: '2026-02-01T11:45:00Z'
    }
  ],
  '3': [
    {
      id: 'h6',
      documentId: '3',
      status: 'draft',
      comment: 'Working draft - needs budget estimates',
      updatedBy: 'Emily Rodriguez',
      timestamp: '2026-02-01T13:00:00Z'
    }
  ],
  '6': [
    {
      id: 'h7',
      documentId: '6',
      status: 'draft',
      comment: 'Initial compliance report',
      updatedBy: 'James Wilson',
      timestamp: '2026-01-18T11:00:00Z'
    },
    {
      id: 'h8',
      documentId: '6',
      status: 'under-review',
      comment: 'Submitted to compliance officer',
      updatedBy: 'James Wilson',
      timestamp: '2026-01-22T10:30:00Z'
    },
    {
      id: 'h9',
      documentId: '6',
      status: 'rejected',
      comment: 'Missing critical sections on data retention policies',
      updatedBy: 'Maria Garcia',
      timestamp: '2026-01-30T15:45:00Z'
    }
  ]
};