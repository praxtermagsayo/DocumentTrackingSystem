import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard';
import { DocumentsList } from './components/documents-list';
import { DocumentDetail } from './components/document-detail';
import { UploadDocument } from './components/upload-document';
import { Inbox } from './components/inbox';
import { Sent } from './components/sent';
import { Drafts } from './components/drafts';
import { Archived } from './components/archived';
import { TeamDocuments } from './components/team-documents';
import { Login } from './components/login';
import { Register } from './components/register';
import { Notifications } from './components/notifications';
import { Settings } from './components/settings';
import { Account } from './components/account';
import { Help } from './components/help';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'documents', Component: DocumentsList },
      { path: 'documents/:id', Component: DocumentDetail },
      { path: 'upload', Component: UploadDocument },
      { path: 'inbox', Component: Inbox },
      { path: 'sent', Component: Sent },
      { path: 'drafts', Component: Drafts },
      { path: 'archived', Component: Archived },
      { path: 'teams/:teamId', Component: TeamDocuments },
      { path: 'notifications', Component: Notifications },
      { path: 'settings', Component: Settings },
      { path: 'account', Component: Account },
      { path: 'help', Component: Help },
    ],
  },
]);