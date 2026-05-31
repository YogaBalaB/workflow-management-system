import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import Login from '../pages/auth/Login.jsx';
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import RequestList from '../pages/requests/RequestList.jsx';
import RequestDetails from '../pages/requests/RequestDetails.jsx';
import CreateRequest from '../pages/requests/CreateRequest.jsx';
import NotFound from '../pages/errors/NotFound.jsx';
import Unauthorized from '../pages/errors/Unauthorized.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (Requires Login) */}
      <Route element={<ProtectedRoute />}>
        {/* Core screens shared by all authenticated users */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/requests" element={<RequestList />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
      </Route>

      {/* Scoped Protected Routes: Submit Request is for Users only */}
      <Route element={<ProtectedRoute allowedRoles={['User']} />}>
        <Route path="/requests/new" element={<CreateRequest />} />
      </Route>

      {/* Error and Fallback Screens */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      
      {/* Route Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
