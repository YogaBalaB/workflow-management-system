import crypto from 'crypto';
import { requestRepository } from '../repositories/requestRepository.js';
import { historyRepository } from '../repositories/historyRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { validateTransition } from '../utils/workflowRules.js';
import { responseHandler } from '../utils/responseHandler.js';
import { query } from '../config/db.js';

const parseDbTimestamp = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const raw = String(value).trim();
  const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(raw);
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  return new Date(hasTimezone ? normalized : `${normalized}Z`);
};

const getLatestStatusTransitionTime = async (requestId, status) => {
  const historySql = `
    SELECT created_at
    FROM request_history
    WHERE request_id = $1 AND new_status = $2
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const historyRes = await query(historySql, [requestId, status]);
  return historyRes.rows[0]?.created_at || null;
};

const isPendingRequestEligibleForManager = async (request, managerCreatedAt) => {
  if (request.assigned_manager_id) {
    return true;
  }

  if (!managerCreatedAt) {
    return true;
  }

  if (!['Submitted', 'Reopened'].includes(request.status)) {
    return true;
  }

  const transitionTime = await getLatestStatusTransitionTime(request.id, request.status);
  const pendingSince = parseDbTimestamp(transitionTime ?? request.created_at);
  const managerCreated = parseDbTimestamp(managerCreatedAt);
  return pendingSince && managerCreated ? pendingSince >= managerCreated : true;
};

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

      let userCreatedAt = null;
      if (role === 'Manager') {
        const manager = await userRepository.findById(userId);
        userCreatedAt = manager?.created_at || null;
      }

      const requests = await requestRepository.findAll({
        role,
        userId,
        userCreatedAt,
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

      let managerCreatedAt = null;
      if (role === 'Manager') {
        const manager = await userRepository.findById(userId);
        managerCreatedAt = manager?.created_at || null;
      }

      // 2.5 Set managerClaimAllowed flag (eligibility check only — no assignment on view)
      if (role === 'Manager' && !request.assigned_manager_id && (request.status === 'Submitted' || request.status === 'Reopened')) {
        const eligible = await isPendingRequestEligibleForManager(request, managerCreatedAt);
        request.managerClaimAllowed = eligible;
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

      // 2.5 Security check: Managers can only action requests assigned to them (or unassigned, which they claim)
      if (role === 'Manager') {
        if (request.assigned_manager_id && request.assigned_manager_id !== userId) {
          return responseHandler.error(res, 'Access Forbidden: This request is already assigned to another manager.', null, 403);
        }
        if (!request.assigned_manager_id) {
          const manager = await userRepository.findById(userId);
          const managerCreatedAt = manager?.created_at || null;
          const eligible = await isPendingRequestEligibleForManager(request, managerCreatedAt);
          if (!eligible) {
            return responseHandler.error(res, 'Access Forbidden: This request became pending before your manager account was created.', null, 403);
          }

          // Claim dynamically on action
          const claimResult = await requestRepository.assign(id, userId);
          if (!claimResult) {
            return responseHandler.error(res, 'Access Forbidden: Another manager claimed this request before you could act on it. Refresh and try again.', null, 403);
          }
          request.assigned_manager_id = userId;

          // Log claim history
          const historyId = crypto.randomUUID();
          await historyRepository.create({
            id: historyId,
            request_id: id,
            old_status: currentStatus,
            new_status: currentStatus,
            comments: `Request claimed by Manager ${req.user.name}.`,
            updated_by: userId
          });
        }
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
  },

  /**
   * Get timed-out pending requests for Manager dashboard
   */
  async getRequestReminders(req, res, next) {
    try {
      // 1. Get response time limit setting
      const settingsSql = "SELECT value FROM settings WHERE key = 'response_time_limit' LIMIT 1";
      const settingsRes = await query(settingsSql);
      const rawLimit = settingsRes.rows[0]?.value;
      const limitSeconds = Number.isFinite(Number(rawLimit)) ? parseInt(rawLimit, 10) : 0;

      // 2. Query pending requests (unassigned or assigned to current manager)
      const sql = `
        SELECT r.*, u.name as creator_name, u.email as creator_email
        FROM requests r
        JOIN users u ON r.created_by = u.id
        WHERE r.status IN ('Submitted', 'Reopened')
          AND (r.assigned_manager_id IS NULL OR r.assigned_manager_id = $1)
        ORDER BY r.created_at ASC
      `;
      const manager = await userRepository.findById(req.user.id);
      const managerCreatedAt = manager?.created_at || null;

      const requestsRes = await query(sql, [req.user.id]);
      const pendingRequests = requestsRes.rows;

      const reminders = [];
      const now = new Date();

      for (const reqObj of pendingRequests) {
        if (!await isPendingRequestEligibleForManager(reqObj, managerCreatedAt)) {
          continue;
        }

        // Query the latest history entry for this status transition
        const historySql = `
          SELECT created_at 
          FROM request_history 
          WHERE request_id = $1 AND new_status = $2 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        const historyRes = await query(historySql, [reqObj.id, reqObj.status]);

        let transitionTime = reqObj.created_at;
        if (historyRes.rows.length > 0) {
          transitionTime = historyRes.rows[0].created_at;
        }

        const parsedTransitionTime = parseDbTimestamp(transitionTime);
        if (!parsedTransitionTime) {
          continue;
        }

        const elapsedMs = now.valueOf() - parsedTransitionTime.valueOf();
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        if (elapsedMs >= limitSeconds * 1000) {
          reminders.push({
            id: reqObj.id,
            title: reqObj.title,
            status: reqObj.status,
            priority: reqObj.priority,
            category: reqObj.category,
            creator_name: reqObj.creator_name,
            creator_email: reqObj.creator_email,
            created_at: reqObj.created_at,
            transitionTime,
            elapsedSeconds,
            limitSeconds
          });
        }
      }

      return responseHandler.success(res, reminders, 'Reminders retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }
};
