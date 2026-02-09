import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider, useApp } from './contexts/AppContext';
import { Toaster } from 'sonner';

function ToastWithTheme() {
  const { resolvedTheme } = useApp();
  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <ToastWithTheme />
    </AppProvider>
  );
}
