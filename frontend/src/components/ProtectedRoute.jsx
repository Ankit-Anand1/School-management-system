import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useAuth();

  // Show a loading spinner while verifying the JWT token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0C29] via-[#201A4A] to-[#150e3a]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          <p className="text-gray-400 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // No user means not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch — redirect to the correct dashboard
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
