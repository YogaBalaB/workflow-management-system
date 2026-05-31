import { api } from './api.js';

export const authService = {
  /**
   * Login credentials and store JWT token
   * Returns { token, user: { id, name, email, role } }
   */
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Register a new account
   * Returns { token, user: { id, name, email, role } }
   */
  async register(name, email, password, role) {
    const data = await api.post('/auth/register', { name, email, password, role });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Log out active user session and purge localStorage keys
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Fetch details of currently logged-in user profile
   */
  async getProfile() {
    return api.get('/auth/me');
  },

  /**
   * Get cached user from localStorage (safely handles missing values)
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user session exists (has token stored)
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
