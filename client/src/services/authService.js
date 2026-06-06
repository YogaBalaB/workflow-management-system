import { api } from './api.js';

export const authService = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data.token && data.user && data.user.role) {
      const role = data.user.role;
      // token_* and user_* stay in localStorage (role-keyed, safe to share across tabs)
      localStorage.setItem(`token_${role}`, data.token);
      localStorage.setItem(`user_${role}`, JSON.stringify(data.user));
      // activeRole goes in sessionStorage — per-tab, never bleeds into other tabs
      sessionStorage.setItem('activeRole', role);
    }
    return data;
  },

  async register(name, email, password, role) {
    const data = await api.post('/auth/register', { name, email, password, role });
    if (data.token && data.user && data.user.role) {
      const uRole = data.user.role;
      localStorage.setItem(`token_${uRole}`, data.token);
      localStorage.setItem(`user_${uRole}`, JSON.stringify(data.user));
      sessionStorage.setItem('activeRole', uRole);
    }
    return data;
  },

  logout(role) {
    const target = role || sessionStorage.getItem('activeRole');
    if (target) {
      localStorage.removeItem(`token_${target}`);
      localStorage.removeItem(`user_${target}`);
      sessionStorage.removeItem('activeRole');
    }
  },

  async getProfile() {
    return api.get('/auth/me');
  },

  getCurrentUser() {
    try {
      const activeRole = sessionStorage.getItem('activeRole');
      if (!activeRole) return null;
      const user = localStorage.getItem(`user_${activeRole}`);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    const activeRole = sessionStorage.getItem('activeRole');
    if (!activeRole) return false;
    return !!localStorage.getItem(`token_${activeRole}`);
  },

  hasSession(role) {
    return !!localStorage.getItem(`token_${role}`);
  },

  getUserByRole(role) {
    try {
      const user = localStorage.getItem(`user_${role}`);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
};