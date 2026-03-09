import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import { Layout } from './components/layout';
import { AuthLayout } from './components/auth-layout';
import { OnboardingLayout } from './components/onboarding-layout';
import { UpdatePassword } from './components/update-password';
import { Dashboard } from './components/dashboard';
import { DocumentRepository } from './components/document-repository';
import { DocumentDetail } from './components/document-detail';
import { UploadDocument } from './components/upload-document';
import { Archived } from './components/archived';
import { Notifications } from './components/notifications';
import { Activities } from './components/activities';
import { EventCategories } from './components/event-categories';
import { DocumentCategories } from './components/document-categories';
import { ScheduleReport } from './components/schedule-report';
import { Settings } from './components/settings';
import { Account } from './components/account';
import { Help } from './components/help';
import { useApp } from './contexts/AppContext';

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, needsOnboarding } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user hasn't finished onboarding and they aren't already on the onboarding page
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Layout />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: AuthLayout,
  },
  {
    path: '/register',
    element: <Navigate to="/login?view=register" replace />,
  },
  {
    path: '/onboarding',
    Component: OnboardingLayout,
  },
  {
    path: '/forgot-password',
    element: <Navigate to="/login?view=forgot" replace />,
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
      { path: 'document-categories', Component: DocumentCategories },
      { path: 'settings', Component: Settings },
      { path: 'account', Component: Account },
      { path: 'help', Component: Help },
    ],
  },
  {
    path: '/schedule-report',
    element: (
      <ProtectedRoute>
        <ScheduleReport />
      </ProtectedRoute>
    ),
  },
]);
