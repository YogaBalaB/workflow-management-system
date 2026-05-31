import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Loader from '../common/Loader.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <Loader fullPage size="large" />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.body}>
        <Sidebar />
        <main style={s.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const s = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f8fafc',   /* page background — light gray */
  },
  body: {
    display: 'flex',
    gap: 24,
    flex: 1,
    maxWidth: 1480,
    width: '100%',
    margin: '0 auto',
    padding: '24px 28px 48px',
    alignItems: 'flex-start',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
};

export default ProtectedRoute;