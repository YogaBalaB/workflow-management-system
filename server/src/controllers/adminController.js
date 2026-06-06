import crypto from 'crypto';
import { query } from '../config/db.js';
import { hashPassword } from '../utils/hashPassword.js';
import { responseHandler } from '../utils/responseHandler.js';

export const adminController = {
  /**
   * Get all managers from the database
   */
  async getManagers(req, res, next) {
    try {
      const sql = `
        SELECT id, name, email, role, is_enabled, created_at 
        FROM users 
        WHERE role = 'Manager' 
        ORDER BY created_at DESC
      `;
      const result = await query(sql);
      // Normalise is_enabled: SQLite returns 0/1 integers — convert to true/false boolean
      const managers = result.rows.map(m => ({
        ...m,
        is_enabled: m.is_enabled === 1 || m.is_enabled === true
      }));
      return responseHandler.success(res, managers, 'Managers retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create a new manager account
   */
  async createManager(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return responseHandler.error(res, 'All fields (name, email, password) are required.', null, 400);
      }

      if (password.length < 6) {
        return responseHandler.error(res, 'Password must be at least 6 characters.', null, 400);
      }

      // Check if email already exists
      const checkSql = 'SELECT id FROM users WHERE email = $1 LIMIT 1';
      const checkRes = await query(checkSql, [email.trim().toLowerCase()]);
      if (checkRes.rows.length > 0) {
        return responseHandler.error(res, 'An account with this email already exists.', null, 400);
      }

      const hashedPassword = await hashPassword(password);
      const id = crypto.randomUUID();

      const insertSql = `
        INSERT INTO users (id, name, email, password, role, is_enabled)
        VALUES ($1, $2, $3, $4, 'Manager', true)
        RETURNING id, name, email, role, is_enabled, created_at
      `;
      const result = await query(insertSql, [id, name.trim(), email.trim().toLowerCase(), hashedPassword]);

      return responseHandler.success(res, result.rows[0], 'Manager account created successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Toggle is_enabled status of a manager
   */
  async toggleManager(req, res, next) {
    try {
      const { id } = req.params;
      const { is_enabled } = req.body;

      if (is_enabled === undefined || is_enabled === null) {
        return responseHandler.error(res, 'is_enabled parameter is required.', null, 400);
      }

      // SQLite stores booleans as integers 1/0. Always coerce to integer.
      // Postgres also accepts 1/0 so this is safe for both.
      const enabledInt = is_enabled ? 1 : 0;

      const sql = `
        UPDATE users 
        SET is_enabled = $1 
        WHERE id = $2 AND role = 'Manager'
        RETURNING id, name, email, role, is_enabled
      `;
      const result = await query(sql, [enabledInt, id]);

      if (result.rows.length === 0) {
        return responseHandler.error(res, 'Manager not found.', null, 404);
      }

      const manager = {
        ...result.rows[0],
        is_enabled: result.rows[0].is_enabled === 1 || result.rows[0].is_enabled === true
      };

      return responseHandler.success(res, manager, 'Manager status updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get response time limit setting
   */
  async getSettings(req, res, next) {
    try {
      const sql = "SELECT value FROM settings WHERE key = 'response_time_limit' LIMIT 1";
      const result = await query(sql);
      const limit = result.rows[0]?.value || '10'; // Default to 10 seconds if not set
      return responseHandler.success(res, { response_time_limit: parseInt(limit, 10) }, 'Settings retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update settings (response_time_limit)
   */
  async updateSettings(req, res, next) {
    try {
      const { response_time_limit } = req.body;

      if (response_time_limit === undefined) {
        return responseHandler.error(res, 'response_time_limit parameter is required.', null, 400);
      }

      const limitStr = String(response_time_limit);
      const key = 'response_time_limit';

      // Agnostic update or insert logic
      const updateSql = 'UPDATE settings SET value = $1 WHERE key = $2';
      const updateRes = await query(updateSql, [limitStr, key]);

      if (updateRes.rowCount === 0) {
        const insertSql = 'INSERT INTO settings (key, value) VALUES ($2, $1)';
        await query(insertSql, [limitStr, key]);
      }

      return responseHandler.success(res, { response_time_limit: parseInt(limitStr, 10) }, 'Settings updated successfully.');
    } catch (err) {
      next(err);
    }
  }
};
