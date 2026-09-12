import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, isLoading, initializeAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white gap-3 select-none">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-neutral-900 font-bold text-xs mb-1">
          JL
        </div>
        <Loader2 size={24} className="animate-spin text-neutral-400" />
        <span className="text-xs text-neutral-400 font-medium">
          Verifying credentials...
        </span>
      </div>
    );
  }

  // If Supabase credentials are not configured in environment or user is not logged in,
  // redirect to admin login page
  const isAuthenticated = Boolean(user && session);

  // During local development when Supabase is not connected yet, allow access to login page
  // but if unauthenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
