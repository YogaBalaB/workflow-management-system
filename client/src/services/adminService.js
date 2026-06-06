import { api } from './api.js';

export const adminService = {
  /** Fetch all managers */
  getManagers: () => api.get('/admin/managers'),

  /** Create a new manager account */
  createManager: (data) => api.post('/admin/managers', data),

  /** Toggle a manager's enabled/disabled status */
  toggleManager: (id, is_enabled) =>
    api.patch(`/admin/managers/${id}/toggle`, { is_enabled }),

  /** Get current admin settings (response_time_limit) */
  getSettings: () => api.get('/admin/settings'),

  /** Update settings */
  updateSettings: (data) => api.put('/admin/settings', data),

  /** Fetch reminders (Manager role) */
  getReminders: () => api.get('/requests/reminders'),
};
