import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('store_admin_token');
  return token ? children : <Navigate to="/dashboard/login" replace state={{ from: location }} />;
}
