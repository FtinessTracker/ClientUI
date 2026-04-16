import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import AppLayout from './layouts/AppLayout';
import ClientLayout from './layouts/ClientLayout';
import Home from './pages/Home';
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import TrainerDashboard from './pages/trainer/Dashboard';
import TrainerOnboarding from './pages/trainer/Onboarding';
import TrainerSchedule from './pages/trainer/Schedule';
import TrainerClients from './pages/trainer/Clients';
import TrainerMessages from './pages/trainer/Messages';
import TrainerPayments from './pages/trainer/Payments';
import TrainerProfilePage from './pages/trainer/Profile';
import LibraryPage from './pages/trainer/Library';
import TrainerSignIn from './pages/trainer/auth/TrainerSignIn';
import TrainerSignUp from './pages/trainer/auth/TrainerSignUp';
import TrainerDiscovery from './pages/client/TrainerDiscovery';
import TrainerProfile from './pages/client/TrainerProfile';
import BookingFlow from './pages/client/BookingFlow';
import OnboardingQuestions from './pages/client/OnboardingQuestions';
import ClientProfilePage from './pages/client/ClientProfile';
import CalendarPage from './pages/client/CalendarPage';
import WorkoutsPage from './pages/client/WorkoutsPage';
import NutritionPage from './pages/client/NutritionPage';
import PlansPage from './pages/client/PlansPage';
import ProductsPage from './pages/client/ProductsPage';
import ResearchArticles from './pages/client/ResearchArticles';
import SessionRoom from './pages/shared/SessionRoom';
import { useAppUser } from './hooks/useAppUser';
import { authService } from './services/authService';

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
          <p className="text-slate-900 font-black text-xl tracking-tighter">TrainLiv</p>
          <p className="text-slate-400 text-sm font-medium mt-1">Loading...</p>
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

function TrainerRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { appUser, isLoaded } = useAppUser();
  const location = useLocation();

  if (!isLoaded) return <LoadingScreen />;

  const isSignedIn = authService.isSignedIn();
  const isMocked = localStorage.getItem('mockTrainer') !== null;

  if (!isSignedIn && !isMocked) {
    return <Navigate to="/trainer/sign-in" state={{ from: location }} replace />;
  }

  if (!isMocked && appUser && appUser.role !== 'trainer') {
    return <Navigate to="/calendar" replace />;
  }

  return <AppLayout user={appUser}>{children}</AppLayout>;
}

function ClientRoute({ children }: { children: React.ReactNode }) {
  const { appUser, isLoaded } = useAppUser();
  const location = useLocation();

  if (!isLoaded) return <LoadingScreen />;

  const isSignedIn = authService.isSignedIn();

  if (!isSignedIn) {
    return <Navigate to="/sign-up" state={{ from: location }} replace />;
  }

  if (appUser?.role === 'trainer') {
    return <Navigate to="/trainer/dashboard" replace />;
  }

  return <ClientLayout>{children}</ClientLayout>;
}

function SessionRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isSignedIn = authService.isSignedIn();
  const isMocked = localStorage.getItem('mockTrainer') !== null;

  if (!isSignedIn && !isMocked) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { appUser } = useAppUser();
  const isSignedIn = authService.isSignedIn();
  const currentUser = authService.getCurrentUser();

  return (
    <Routes>
      <Route path="/" element={<Home user={appUser} />} />
      <Route
        path="/sign-in"
        element={isSignedIn
          ? <Navigate to={currentUser?.role === 'trainer' ? '/trainer/dashboard' : '/calendar'} />
          : <SignInPage />
        }
      />
      <Route
        path="/sign-up"
        element={isSignedIn
          ? <Navigate to={currentUser?.role === 'trainer' ? '/trainer/dashboard' : '/onboarding'} />
          : <SignUpPage />
        }
      />
      <Route path="/onboarding" element={isSignedIn ? <OnboardingQuestions /> : <Navigate to="/sign-up" />} />
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />

      <Route path="/calendar" element={<ClientRoute><CalendarPage /></ClientRoute>} />
      <Route path="/workouts" element={<ClientRoute><WorkoutsPage /></ClientRoute>} />
      <Route path="/nutrition" element={<ClientRoute><NutritionPage /></ClientRoute>} />
      <Route path="/plans" element={<ClientRoute><PlansPage /></ClientRoute>} />
      <Route path="/products" element={<ClientRoute><ProductsPage /></ClientRoute>} />
      <Route path="/research" element={<ClientRoute><ResearchArticles /></ClientRoute>} />
      <Route path="/profile" element={<ClientRoute><ClientProfilePage /></ClientRoute>} />
      <Route path="/trainers" element={<ClientRoute><TrainerDiscovery /></ClientRoute>} />
      <Route path="/trainer/:id" element={<ClientRoute><TrainerProfile /></ClientRoute>} />
      <Route path="/book/:id" element={<ClientRoute><BookingFlow /></ClientRoute>} />
      <Route path="/session/:id" element={<SessionRoute><SessionRoom /></SessionRoute>} />

      <Route path="/trainer/sign-in" element={<TrainerSignIn />} />
      <Route path="/trainer/sign-up" element={<TrainerSignUp />} />
      <Route path="/trainer/login" element={<Navigate to="/trainer/sign-in" replace />} />
      <Route path="/trainer-onboarding" element={<TrainerOnboarding />} />

      <Route path="/trainer/dashboard" element={<TrainerRoute><TrainerDashboard /></TrainerRoute>} />
      <Route path="/trainer/schedule" element={<TrainerRoute><TrainerSchedule /></TrainerRoute>} />
      <Route path="/trainer/clients" element={<TrainerRoute><TrainerClients /></TrainerRoute>} />
      <Route path="/trainer/messages" element={<TrainerRoute><TrainerMessages /></TrainerRoute>} />
      <Route path="/trainer/payments" element={<TrainerRoute><TrainerPayments /></TrainerRoute>} />
      <Route path="/trainer/library" element={<TrainerRoute><LibraryPage /></TrainerRoute>} />
      <Route path="/trainer/profile" element={<TrainerRoute><TrainerProfilePage /></TrainerRoute>} />

      <Route path="/dashboard" element={<Navigate to="/trainer/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}
