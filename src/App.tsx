import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Dumbbell, AlertTriangle } from 'lucide-react';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import ClientDashboard from './pages/client/Dashboard';
import TrainerDashboard from './pages/trainer/Dashboard';
import TrainerDiscovery from './pages/client/TrainerDiscovery';
import TrainerProfile from './pages/client/TrainerProfile';
import BookingFlow from './pages/client/BookingFlow';
import SessionRoom from './pages/shared/SessionRoom';
import { useAppUser } from './hooks/useAppUser';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20"
        >
          <Dumbbell className="text-accent w-7 h-7" />
        </motion.div>
        <div className="text-center">
          <p className="text-slate-900 font-black text-xl tracking-tighter">FlexFit</p>
          <p className="text-slate-400 text-sm font-medium mt-1">Loading your dashboard...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-accent rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const { appUser, isLoaded: userLoaded } = useAppUser();
  const location = useLocation();

  if (!isLoaded || !userLoaded) return <LoadingScreen />;

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (allowedRoles && appUser && !allowedRoles.includes(appUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout user={appUser}>{children}</AppLayout>;
}

function AppRoutes() {
  const { isSignedIn, isLoaded } = useAuth();
  const { appUser } = useAppUser();

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Home user={appUser} />} />
      <Route path="/sign-in" element={isSignedIn ? <Navigate to="/dashboard" /> : <SignInPage />} />
      <Route path="/sign-up" element={isSignedIn ? <Navigate to="/dashboard" /> : <SignUpPage />} />
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {appUser?.role === 'trainer' ? <TrainerDashboard /> : <ClientDashboard />}
          </ProtectedRoute>
        }
      />
      <Route path="/session/:id" element={<ProtectedRoute><SessionRoom /></ProtectedRoute>} />
      <Route path="/trainers" element={<ProtectedRoute allowedRoles={['client']}><TrainerDiscovery /></ProtectedRoute>} />
      <Route path="/trainer/:id" element={<ProtectedRoute allowedRoles={['client']}><TrainerProfile /></ProtectedRoute>} />
      <Route path="/book/:id" element={<ProtectedRoute allowedRoles={['client']}><BookingFlow /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function NoClerkBanner() {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-lg text-sm font-semibold text-amber-800 max-w-sm">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
      <span>Add your Clerk key in <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">.env</code> to enable auth</span>
    </div>
  );
}

function NoClerkApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Home user={null} /><NoClerkBanner /></>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  const hasClerk = typeof import.meta.env.VITE_CLERK_PUBLISHABLE_KEY === 'string' &&
    (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') ||
     import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_live_')) &&
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder');

  if (!hasClerk) {
    return (
      <QueryClientProvider client={queryClient}>
        <NoClerkApp />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}
