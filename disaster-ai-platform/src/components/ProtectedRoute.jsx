import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute — guards routes that require an authenticated emergency officer.
 *
 * allowedRoles: string[] — e.g. ['ndrf'] or ['fire']
 *
 * If no token/user → redirect to /login (preserving attempted path via state)
 * If role mismatch → redirect to their correct dashboard
 * Otherwise → render children
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    // Send them to login and remember where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to the correct dashboard for their role
      if (user.role === 'ndrf')  return <Navigate to="/ndrf-dashboard" replace />;
      if (user.role === 'fire')  return <Navigate to="/fire-dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    // Corrupt storage — clear and force re-login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userDepartment');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
