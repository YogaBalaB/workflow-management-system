import { query } from '../config/db.js';

export const requestRepository = {
  /**
   * Create a new request in the database
   */
  async create({ id, title, description, category, priority, status, created_by }) {
    const sql = `
      INSERT INTO requests (id, title, description, category, priority, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await query(sql, [id, title, description, category, priority, status || 'Submitted', created_by]);
    return result.rows[0];
  },

  /**
   * Find a single request by its UUID, including details of the creator
   */
  async findById(id) {
    const sql = `
      SELECT r.*, u.name as creator_name, u.email as creator_email, m.name as assigned_manager_name 
      FROM requests r
      JOIN users u ON r.created_by = u.id
      LEFT JOIN users m ON r.assigned_manager_id = m.id
      WHERE r.id = $1 LIMIT 1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Atomically claim a request for a manager — only succeeds if still unassigned.
   * Returns the updated row if claim succeeded, or null if another manager already claimed it.
   * This prevents race conditions when multiple managers open the same request simultaneously.
   */
  async assign(id, managerId) {
    const sql = `
      UPDATE requests
      SET assigned_manager_id = $1
      WHERE id = $2
        AND assigned_manager_id IS NULL
      RETURNING *
    `;
    const result = await query(sql, [managerId, id]);
    return result.rows[0] || null;
  },

  /**
   * Find all requests based on user role and apply filters
   */
  async findAll({ role, userId, userCreatedAt, search, status, category, priority }) {
    let sql = `
      SELECT r.*, u.name as creator_name, u.email as creator_email
      FROM requests r
      JOIN users u ON r.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // 1. Role-based scoping
    if (role === 'User') {
      sql += ` AND r.created_by = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (role === 'Manager') {
      sql += ` AND (
        r.assigned_manager_id = $${paramIndex}
        OR r.status NOT IN ('Submitted', 'Reopened')
        OR (
          r.assigned_manager_id IS NULL
          AND r.status IN ('Submitted', 'Reopened')
          AND COALESCE(
            (SELECT created_at FROM request_history WHERE request_id = r.id AND new_status = r.status ORDER BY created_at DESC LIMIT 1),
            r.created_at
          ) >= $${paramIndex + 1}
        )
      )`;
      params.push(userId, userCreatedAt);
      paramIndex += 2;
    }

    // 2. Search filter (title / description)
    if (search) {
      sql += ` AND (LOWER(r.title) LIKE LOWER($${paramIndex}) OR LOWER(r.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 3. Status filter
    if (status) {
      sql += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // 4. Category filter
    if (category) {
      sql += ` AND r.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // 5. Priority filter
    if (priority) {
      sql += ` AND r.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Order by newest first
    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Update the status of a request
   */
  async updateStatus(id, status) {
    const sql = `
      UPDATE requests
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, id]);
    return result.rows[0];
  },

  /**
   * Get basic stats for dashboard metrics
   */
  async getStats(role, userId) {
    let sql = 'SELECT status, COUNT(*) as count FROM requests';
    const params = [];

    if (role === 'User') {
      sql += ' WHERE created_by = $1';
      params.push(userId);
    }

    sql += ' GROUP BY status';

    const result = await query(sql, params);
    return result.rows;
  }
};