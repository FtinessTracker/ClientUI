import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockApi } from './services/mockApi';
import { User } from './types';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import ClientDashboard from './pages/client/Dashboard';
import TrainerDashboard from './pages/trainer/Dashboard';
import TrainerDiscovery from './pages/client/TrainerDiscovery';
import TrainerProfile from './pages/client/TrainerProfile';
import BookingFlow from './pages/client/BookingFlow';
import SessionRoom from './pages/shared/SessionRoom';

const queryClient = new QueryClient();

function ProtectedRoute({ 
  children, 
  user, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  user: User | null, 
  allowedRoles?: string[] 
}) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout user={user}>{children}</AppLayout>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading FlexFit...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

          {/* Shared Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                {user?.role === 'client' ? <ClientDashboard /> : <TrainerDashboard />}
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/session/:id" 
            element={
              <ProtectedRoute user={user}>
                <SessionRoom />
              </ProtectedRoute>
            } 
          />

          {/* Client Only Routes */}
          <Route 
            path="/trainers" 
            element={
              <ProtectedRoute user={user} allowedRoles={['client']}>
                <TrainerDiscovery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/:id" 
            element={
              <ProtectedRoute user={user} allowedRoles={['client']}>
                <TrainerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book/:id" 
            element={
              <ProtectedRoute user={user} allowedRoles={['client']}>
                <BookingFlow />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
