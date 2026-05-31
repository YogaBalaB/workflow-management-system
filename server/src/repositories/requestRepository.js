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
      SELECT r.*, u.name as creator_name, u.email as creator_email 
      FROM requests r
      JOIN users u ON r.created_by = u.id
      WHERE r.id = $1 LIMIT 1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Find all requests based on user role and apply filters
   */
  async findAll({ role, userId, search, status, category, priority }) {
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
      // In the PRD it says "Manager: View all pending requests". We will allow viewing all,
      // but let them easily filter. To strictly respect FR-3: if status filter is not specified, 
      // we can optionally default or let them view all. Showing all requests in the list is 
      // standard for tracking, so we support all filters.
    }

    // 2. Search filter (title / description)
    if (search) {
      sql += ` AND (r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      // For SQLite, ILIKE is not case sensitive by default using LIKE, 
      // but standard postgres supports ILIKE. In SQLite, ILIKE is parsed or fallback to LIKE.
      // To support both, we'll use standard lower() comparison which works on both!
      sql = sql.replace(`r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex}`, 
                        `LOWER(r.title) LIKE LOWER($${paramIndex}) OR LOWER(r.description) LIKE LOWER($${paramIndex})`);
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
   * Get basic stats for dashboard dashboard metrics
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
