import crypto from 'crypto';
import { requestRepository } from '../repositories/requestRepository.js';
import { historyRepository } from '../repositories/historyRepository.js';
import { validateTransition } from '../utils/workflowRules.js';
import { responseHandler } from '../utils/responseHandler.js';

export const requestController = {
  /**
   * Submit a new request (defaults to 'Submitted')
   */
  async createRequest(req, res, next) {
    try {
      const { title, description, category, priority } = req.body;
      const requestId = crypto.randomUUID();
      const userId = req.user.id;

      // 1. Create the request in DB
      const newRequest = await requestRepository.create({
        id: requestId,
        title,
        description,
        category,
        priority,
        status: 'Submitted',
        created_by: userId
      });

      // 2. Create the initial history log (audit trail)
      const historyId = crypto.randomUUID();
      await historyRepository.create({
        id: historyId,
        request_id: requestId,
        old_status: 'None',
        new_status: 'Submitted',
        comments: 'Request submitted for review.',
        updated_by: userId
      });

      return responseHandler.created(res, newRequest, 'Request submitted successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all requests scoped to role permissions and filters
   */
  async getRequests(req, res, next) {
    try {
      const { search, status, category, priority } = req.query;
      const userId = req.user.id;
      const role = req.user.role;

      const requests = await requestRepository.findAll({
        role,
        userId,
        search,
        status,
        category,
        priority
      });

      return responseHandler.success(res, requests, 'Requests retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a request by its ID along with its transition logs
   */
  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      // 1. Fetch request details
      const request = await requestRepository.findById(id);
      if (!request) {
        return responseHandler.error(res, 'Request not found.', null, 404);
      }

      // 2. Security validation: standard user can only view their own requests
      if (role === 'User' && request.created_by !== userId) {
        return responseHandler.error(res, 'Unauthorized. You do not have permission to view this request.', null, 403);
      }

      // 3. Fetch history timeline
      const history = await historyRepository.findByRequestId(id);

      return responseHandler.success(res, {
        ...request,
        history
      }, 'Request details retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Execute a state transition (Approve, Reject, Clarify, Close, Reopen)
   */
  async updateRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status: nextStatus, comments } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      // 1. Find request
      const request = await requestRepository.findById(id);
      if (!request) {
        return responseHandler.error(res, 'Request not found.', null, 404);
      }

      const currentStatus = request.status;

      // 2. Security check: users can only transition their own requests
      if (role === 'User' && request.created_by !== userId) {
        return responseHandler.error(res, 'Unauthorized. You cannot update status on other users\' requests.', null, 403);
      }

      // 3. Validate transition based on workflow rules
      const transition = validateTransition(currentStatus, nextStatus, role);
      if (!transition.isValid) {
        return responseHandler.error(res, transition.message, null, 400);
      }

      // If status is unchanged, return success without DB writes
      if (currentStatus === nextStatus) {
        return responseHandler.success(res, request, 'Status is already set to ' + nextStatus);
      }

      // 4. Update request status
      const updatedRequest = await requestRepository.updateStatus(id, nextStatus);

      // 5. Log audit trail
      const historyId = crypto.randomUUID();
      await historyRepository.create({
        id: historyId,
        request_id: id,
        old_status: currentStatus,
        new_status: nextStatus,
        comments: comments || `Status changed from ${currentStatus} to ${nextStatus}.`,
        updated_by: userId
      });

      return responseHandler.success(res, updatedRequest, `Request status updated to ${nextStatus} successfully.`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch aggregate request statistics for the dashboard
   */
  async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      const rawStats = await requestRepository.getStats(role, userId);
      
      // Transform stats to a cleaner key-value pair map
      const stats = {
        Submitted: 0,
        Approved: 0,
        Rejected: 0,
        'Needs Clarification': 0,
        Closed: 0,
        Reopened: 0,
        Total: 0
      };

      let total = 0;
      rawStats.forEach(row => {
        const count = parseInt(row.count || '0', 10);
        stats[row.status] = count;
        total += count;
      });
      stats.Total = total;

      return responseHandler.success(res, stats, 'Dashboard metrics retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }
};
