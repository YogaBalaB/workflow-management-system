import { api } from './api.js';

export const requestService = {
  /**
   * Get all requests scoped to role with active filters applied
   */
  async getRequests(filters = {}) {
    return api.get('/requests', filters);
  },

  /**
   * Get detail information for a single request, including transition histories
   */
  async getRequestById(id) {
    return api.get(`/requests/${id}`);
  },

  /**
   * Submit a new workflow request
   */
  async createRequest(requestData) {
    return api.post('/requests', requestData);
  },

  /**
   * Update request status (Approve, Reject, Clarify, Close, Reopen)
   */
  async updateRequestStatus(id, status, comments) {
    return api.patch(`/requests/${id}/status`, { status, comments });
  },

  /**
   * Fetch aggregate data metrics for the dashboard stats
   */
  async getDashboardStats() {
    return api.get('/requests/stats');
  }
};
