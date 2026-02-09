import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from 'sonner@2.0.3';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AppProvider>
  );
}