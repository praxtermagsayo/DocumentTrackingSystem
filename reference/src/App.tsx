import { RouterProvider, createBrowserRouter } from 'react-router';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from 'sonner@2.0.3';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard';
import { DocumentsList } from './components/documents-list';
import { DocumentDetail } from './components/document-detail';
import { UploadDocument } from './components/upload-document';
import { MyTasks } from './components/my-tasks';
import { SearchPage } from './components/search-page';
import { RetentionAndArchive } from './components/retention-archive';
import { AuditTrail } from './components/audit-trail';
import { Reports } from './components/reports';
import { AdminSettings } from './components/admin-settings';
import { Login } from './components/login';
import { Register } from './components/register';
import { Notifications } from './components/notifications';
import { Settings } from './components/settings';
import { Account } from './components/account';
import { Help } from './components/help';
import { useMemo } from 'react';

function AppRouter() {
  const router = useMemo(() => createBrowserRouter([
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
        { path: 'my-tasks', Component: MyTasks },
        { path: 'search', Component: SearchPage },
        { path: 'retention', Component: RetentionAndArchive },
        { path: 'audit', Component: AuditTrail },
        { path: 'reports', Component: Reports },
        { path: 'admin', Component: AdminSettings },
        { path: 'notifications', Component: Notifications },
        { path: 'settings', Component: Settings },
        { path: 'account', Component: Account },
        { path: 'help', Component: Help },
      ],
    },
  ]), []);

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster position="top-right" />
    </AppProvider>
  );
}