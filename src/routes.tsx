import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/layout';
import { Login } from './components/login';
import { ForgotPassword } from './components/forgot-password';
import { UpdatePassword } from './components/update-password';
import { Register } from './components/register';
import { Dashboard } from './components/dashboard';
import { DocumentRepository } from './components/document-repository';
import { DocumentDetail } from './components/document-detail';
import { UploadDocument } from './components/upload-document';
import { Archived } from './components/archived';
import { Notifications } from './components/notifications';
import { Activities } from './components/activities';
import { EventCategories } from './components/event-categories';
import { Settings } from './components/settings';
import { Account } from './components/account';
import { Help } from './components/help';
import { useApp } from './contexts/AppContext';

function ProtectedRoute() {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

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
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  {
    path: '/update-password',
    Component: UpdatePassword,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, Component: Dashboard },
      { path: 'documents', Component: DocumentRepository },
      { path: 'documents/:id', Component: DocumentDetail },
      { path: 'upload', Component: UploadDocument },
      { path: 'archived', Component: Archived },
      { path: 'notifications', Component: Notifications },
      { path: 'activities', Component: Activities },
      { path: 'event-categories', Component: EventCategories },
      { path: 'settings', Component: Settings },
      { path: 'account', Component: Account },
      { path: 'help', Component: Help },
    ],
  },
]);
