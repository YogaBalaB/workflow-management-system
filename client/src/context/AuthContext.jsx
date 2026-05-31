import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync state on load
  useEffect(() => {
    const cachedUser = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();

    if (cachedUser && authenticated) {
      setUser(cachedUser);
      setIsAuthenticated(true);
      
      // Verify token/get fresh profile in background
      authService.getProfile()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch((err) => {
          console.warn('Session verification failed, logging out:', err);
          handleLogout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (err) {
      handleLogout();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, role);
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (err) {
      handleLogout();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
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
