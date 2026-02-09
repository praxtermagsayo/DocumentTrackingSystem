import { Document } from '../types';

export const inboxDocuments: Document[] = [
  {
    id: 'inbox-1',
    title: 'NDA_Agreement_NewClient.pdf',
    description: 'Non-disclosure agreement for new client partnership',
    status: 'under-review',
    category: 'Legal',
    createdBy: 'Jennifer Lopez',
    createdAt: '2026-02-03T14:30:00Z',
    updatedAt: '2026-02-04T09:15:00Z',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    trackingId: '#TRK-2024-011',
    ownerName: 'Jennifer Lopez'
  },
  {
    id: 'inbox-2',
    title: 'Budget_Proposal_Q1.xlsx',
    description: 'First quarter budget proposal for marketing department',
    status: 'under-review',
    category: 'Finance',
    createdBy: 'Robert Chen',
    createdAt: '2026-02-03T11:00:00Z',
    updatedAt: '2026-02-04T08:30:00Z',
    fileType: 'XLSX',
    fileSize: '3.2 MB',
    trackingId: '#TRK-2024-012',
    ownerName: 'Robert Chen'
  },
  {
    id: 'inbox-3',
    title: 'Performance_Review_Template.docx',
    description: 'Updated performance review template for annual reviews',
    status: 'under-review',
    category: 'HR',
    createdBy: 'Amanda White',
    createdAt: '2026-02-02T16:45:00Z',
    updatedAt: '2026-02-03T10:20:00Z',
    fileType: 'DOC',
    fileSize: '945 KB',
    trackingId: '#TRK-2024-013',
    ownerName: 'Amanda White'
  },
  {
    id: 'inbox-4',
    title: 'Product_Roadmap_2026.pdf',
    description: 'Comprehensive product roadmap for the year 2026',
    status: 'under-review',
    category: 'Product',
    createdBy: 'Chris Martinez',
    createdAt: '2026-02-02T09:30:00Z',
    updatedAt: '2026-02-03T14:00:00Z',
    fileType: 'PDF',
    fileSize: '4.1 MB',
    trackingId: '#TRK-2024-014',
    ownerName: 'Chris Martinez'
  },
  {
    id: 'inbox-5',
    title: 'Security_Audit_Report.pdf',
    description: 'Annual security audit findings and recommendations',
    status: 'under-review',
    category: 'IT',
    createdBy: 'Diana Kim',
    createdAt: '2026-02-01T13:15:00Z',
    updatedAt: '2026-02-02T11:30:00Z',
    fileType: 'PDF',
    fileSize: '2.7 MB',
    trackingId: '#TRK-2024-015',
    ownerName: 'Diana Kim'
  }
];

export const sentDocuments: Document[] = [
  {
    id: 'sent-1',
    title: 'Contract_Revision_v3.pdf',
    description: 'Revised contract sent to legal team for final approval',
    status: 'approved',
    category: 'Legal',
    createdBy: 'Alex Morgan',
    createdAt: '2026-01-30T10:00:00Z',
    updatedAt: '2026-02-01T15:30:00Z',
    fileType: 'PDF',
    fileSize: '1.5 MB',
    trackingId: '#TRK-2024-016',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'sent-2',
    title: 'Monthly_Sales_Report.xlsx',
    description: 'January sales performance report sent to management',
    status: 'approved',
    category: 'Finance',
    createdBy: 'Alex Morgan',
    createdAt: '2026-01-29T14:20:00Z',
    updatedAt: '2026-01-31T09:45:00Z',
    fileType: 'XLSX',
    fileSize: '2.1 MB',
    trackingId: '#TRK-2024-017',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'sent-3',
    title: 'Training_Schedule_Feb.pdf',
    description: 'February training schedule for all departments',
    status: 'approved',
    category: 'Training',
    createdBy: 'Alex Morgan',
    createdAt: '2026-01-28T11:30:00Z',
    updatedAt: '2026-01-30T16:00:00Z',
    fileType: 'PDF',
    fileSize: '890 KB',
    trackingId: '#TRK-2024-018',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'sent-4',
    title: 'Brand_Guidelines_2026.pdf',
    description: 'Updated brand guidelines sent to marketing team',
    status: 'approved',
    category: 'Marketing',
    createdBy: 'Alex Morgan',
    createdAt: '2026-01-27T09:00:00Z',
    updatedAt: '2026-01-29T13:15:00Z',
    fileType: 'PDF',
    fileSize: '5.3 MB',
    trackingId: '#TRK-2024-019',
    ownerName: 'Alex Morgan'
  }
];

export const draftDocuments: Document[] = [
  {
    id: 'draft-1',
    title: 'Partnership_Proposal_Draft.docx',
    description: 'Draft proposal for strategic partnership opportunity',
    status: 'draft',
    category: 'Business Development',
    createdBy: 'Alex Morgan',
    createdAt: '2026-02-04T08:00:00Z',
    updatedAt: '2026-02-04T09:30:00Z',
    fileType: 'DOC',
    fileSize: '1.2 MB',
    trackingId: '#TRK-2024-020',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'draft-2',
    title: 'Q2_Marketing_Plan.pdf',
    description: 'Work in progress for Q2 marketing initiatives',
    status: 'draft',
    category: 'Marketing',
    createdBy: 'Alex Morgan',
    createdAt: '2026-02-03T15:45:00Z',
    updatedAt: '2026-02-04T08:20:00Z',
    fileType: 'PDF',
    fileSize: '2.8 MB',
    trackingId: '#TRK-2024-021',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'draft-3',
    title: 'Employee_Benefits_Update.docx',
    description: 'Draft document for updated employee benefits package',
    status: 'draft',
    category: 'HR',
    createdBy: 'Alex Morgan',
    createdAt: '2026-02-02T13:00:00Z',
    updatedAt: '2026-02-03T16:45:00Z',
    fileType: 'DOC',
    fileSize: '756 KB',
    trackingId: '#TRK-2024-022',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'draft-4',
    title: 'Annual_Budget_Forecast.xlsx',
    description: 'Preliminary budget forecast for fiscal year 2027',
    status: 'draft',
    category: 'Finance',
    createdBy: 'Alex Morgan',
    createdAt: '2026-02-01T10:15:00Z',
    updatedAt: '2026-02-02T14:30:00Z',
    fileType: 'XLSX',
    fileSize: '3.4 MB',
    trackingId: '#TRK-2024-023',
    ownerName: 'Alex Morgan'
  },
  {
    id: 'draft-5',
    title: 'Website_Redesign_Specs.pdf',
    description: 'Technical specifications for website redesign project',
    status: 'draft',
    category: 'IT',
    createdBy: 'Alex Morgan',
    createdAt: '2026-01-31T11:00:00Z',
    updatedAt: '2026-02-01T09:15:00Z',
    fileType: 'PDF',
    fileSize: '2.2 MB',
    trackingId: '#TRK-2024-024',
    ownerName: 'Alex Morgan'
  }
];

export const archivedDocuments: Document[] = [
  {
    id: 'archive-1',
    title: 'Q3_2025_Financial_Report.pdf',
    description: 'Third quarter 2025 financial performance report',
    status: 'archived',
    category: 'Finance',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-12-01T14:00:00Z',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    trackingId: '#TRK-2023-045',
    ownerName: 'Sarah Johnson'
  },
  {
    id: 'archive-2',
    title: 'Old_Employee_Handbook.docx',
    description: 'Previous version of employee handbook',
    status: 'archived',
    category: 'HR',
    createdBy: 'Michael Chen',
    createdAt: '2025-09-20T09:30:00Z',
    updatedAt: '2025-11-15T11:00:00Z',
    fileType: 'DOC',
    fileSize: '1.9 MB',
    trackingId: '#TRK-2023-038',
    ownerName: 'Michael Chen'
  },
  {
    id: 'archive-3',
    title: '2025_Marketing_Campaign_Results.xlsx',
    description: 'Final results from 2025 marketing campaigns',
    status: 'archived',
    category: 'Marketing',
    createdBy: 'Emily Davis',
    createdAt: '2025-11-10T13:45:00Z',
    updatedAt: '2025-12-20T10:30:00Z',
    fileType: 'XLSX',
    fileSize: '2.6 MB',
    trackingId: '#TRK-2023-052',
    ownerName: 'Emily Davis'
  },
  {
    id: 'archive-4',
    title: 'Legacy_System_Documentation.pdf',
    description: 'Documentation for legacy IT systems',
    status: 'archived',
    category: 'IT',
    createdBy: 'David Miller',
    createdAt: '2025-08-05T08:00:00Z',
    updatedAt: '2025-10-30T16:00:00Z',
    fileType: 'PDF',
    fileSize: '4.7 MB',
    trackingId: '#TRK-2023-029',
    ownerName: 'David Miller'
  },
  {
    id: 'archive-5',
    title: 'Completed_Project_Alpha.pdf',
    description: 'Final documentation for completed Project Alpha',
    status: 'archived',
    category: 'Engineering',
    createdBy: 'Jessica Taylor',
    createdAt: '2025-07-12T14:20:00Z',
    updatedAt: '2025-09-25T09:45:00Z',
    fileType: 'PDF',
    fileSize: '3.8 MB',
    trackingId: '#TRK-2023-021',
    ownerName: 'Jessica Taylor'
  },
  {
    id: 'archive-6',
    title: 'Old_Vendor_Contracts.pdf',
    description: 'Archived vendor contracts from 2025',
    status: 'archived',
    category: 'Legal',
    createdBy: 'James Wilson',
    createdAt: '2025-06-30T11:00:00Z',
    updatedAt: '2025-08-15T13:30:00Z',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    trackingId: '#TRK-2023-015',
    ownerName: 'James Wilson'
  }
];

export const teamDocuments: Record<string, Document[]> = {
  'legal': [
    {
      id: 'legal-1',
      title: 'Client_Agreement_Template.pdf',
      description: 'Standard client agreement template',
      status: 'approved',
      category: 'Legal',
      createdBy: 'Sarah Wilson',
      createdAt: '2026-01-25T10:00:00Z',
      updatedAt: '2026-02-01T14:00:00Z',
      fileType: 'PDF',
      fileSize: '1.4 MB',
      trackingId: '#TRK-2024-025',
      ownerName: 'Sarah Wilson'
    },
    {
      id: 'legal-2',
      title: 'IP_Rights_Documentation.pdf',
      description: 'Intellectual property rights documentation',
      status: 'under-review',
      category: 'Legal',
      createdBy: 'David Miller',
      createdAt: '2026-01-28T09:30:00Z',
      updatedAt: '2026-02-03T11:15:00Z',
      fileType: 'PDF',
      fileSize: '2.9 MB',
      trackingId: '#TRK-2024-026',
      ownerName: 'David Miller'
    }
  ],
  'finance': [
    {
      id: 'finance-1',
      title: 'Tax_Filing_Documents.pdf',
      description: 'Corporate tax filing documentation',
      status: 'approved',
      category: 'Finance',
      createdBy: 'Robert Chen',
      createdAt: '2026-01-20T11:00:00Z',
      updatedAt: '2026-01-30T15:30:00Z',
      fileType: 'PDF',
      fileSize: '3.7 MB',
      trackingId: '#TRK-2024-027',
      ownerName: 'Robert Chen'
    },
    {
      id: 'finance-2',
      title: 'Investment_Portfolio_Review.xlsx',
      description: 'Quarterly investment portfolio analysis',
      status: 'under-review',
      category: 'Finance',
      createdBy: 'Michael Chen',
      createdAt: '2026-01-29T14:00:00Z',
      updatedAt: '2026-02-02T10:45:00Z',
      fileType: 'XLSX',
      fileSize: '2.8 MB',
      trackingId: '#TRK-2024-028',
      ownerName: 'Michael Chen'
    }
  ],
  'hr': [
    {
      id: 'hr-1',
      title: 'Onboarding_Checklist.docx',
      description: 'New employee onboarding checklist',
      status: 'approved',
      category: 'HR',
      createdBy: 'Amanda White',
      createdAt: '2026-01-22T08:30:00Z',
      updatedAt: '2026-01-28T13:00:00Z',
      fileType: 'DOC',
      fileSize: '876 KB',
      trackingId: '#TRK-2024-029',
      ownerName: 'Amanda White'
    },
    {
      id: 'hr-2',
      title: 'Diversity_Initiative_Plan.pdf',
      description: 'Company-wide diversity and inclusion initiative',
      status: 'under-review',
      category: 'HR',
      createdBy: 'Emily Davis',
      createdAt: '2026-02-01T10:15:00Z',
      updatedAt: '2026-02-03T09:30:00Z',
      fileType: 'PDF',
      fileSize: '1.6 MB',
      trackingId: '#TRK-2024-030',
      ownerName: 'Emily Davis'
    }
  ]
};
