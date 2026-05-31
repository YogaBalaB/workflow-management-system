import { query } from '../config/db.js';

export const historyRepository = {
  /**
   * Log an audit history entry for a request status transition
   */
  async create({ id, request_id, old_status, new_status, comments, updated_by }) {
    const sql = `
      INSERT INTO request_history (id, request_id, old_status, new_status, comments, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(sql, [id, request_id, old_status, new_status, comments, updated_by]);
    return result.rows[0];
  },

  /**
   * Get audit log history for a specific request, newest first
   */
  async findByRequestId(requestId) {
    const sql = `
      SELECT h.*, u.name as updater_name, u.role as updater_role 
      FROM request_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.request_id = $1
      ORDER BY h.created_at DESC
    `;
    const result = await query(sql, [requestId]);
    return result.rows;
  }
};
