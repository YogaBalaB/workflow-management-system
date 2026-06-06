import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncState = () => {
    // FIX: reads activeRole from sessionStorage — per-tab, never affected by other tabs
    const activeRole = sessionStorage.getItem('activeRole');
    if (!activeRole) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem(`token_${activeRole}`);
    const rawUser = localStorage.getItem(`user_${activeRole}`);

    if (!token || !rawUser) {
      sessionStorage.removeItem('activeRole');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      if (parsed.role !== activeRole) {
        sessionStorage.removeItem('activeRole');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      setUser(parsed);
      setIsAuthenticated(true);
    } catch {
      sessionStorage.removeItem('activeRole');
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncState();

    const activeRole = sessionStorage.getItem('activeRole');
    const token = activeRole ? localStorage.getItem(`token_${activeRole}`) : null;

    if (activeRole && token) {
      authService.getProfile()
        .then((freshUser) => {
          if (freshUser.role === activeRole) {
            setUser(freshUser);
            localStorage.setItem(`user_${activeRole}`, JSON.stringify(freshUser));
          }
        })
        .catch((err) => {
          console.warn('Session verification failed, logging out:', err);
          handleLogout();
        });
    }
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      syncState();
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const handleRegister = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, role);
      syncState();
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const handleLogout = () => {
    const activeRole = sessionStorage.getItem('activeRole');
    localStorage.removeItem(`user_${activeRole}`);
    localStorage.removeItem(`token_${activeRole}`);
    sessionStorage.removeItem('activeRole');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const switchRole = (role) => {
    if (authService.hasSession(role)) {
      sessionStorage.setItem('activeRole', role);
      syncState();
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    switchRole,
    hasSessionFor: (role) => authService.hasSession(role),
    getUserByRole: (role) => authService.getUserByRole(role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};