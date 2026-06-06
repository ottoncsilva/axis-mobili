import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { Router } from './Router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,           // Always consider cached data stale — refetch on every mount
      gcTime: 1000 * 60 * 5,  // Keep in memory 5min to avoid loading flicker between pages
      retry: 1,
      refetchOnWindowFocus: true,    // Refetch when user returns to the tab
      refetchOnMount: true,          // Refetch every time a component mounts
      refetchOnReconnect: true,      // Refetch after network reconnect
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
