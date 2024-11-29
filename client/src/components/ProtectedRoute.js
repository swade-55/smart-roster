// ProtectedRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasSubscription } = useSelector((state) => state.auth);
  
  console.log('ProtectedRoute auth state:', { isAuthenticated, hasSubscription });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasSubscription) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
};

export default ProtectedRoute;