import { query } from '../config/db.js';

export const userRepository = {
  /**
   * Find a user by their email address
   */
  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  },

  /**
   * Find a user by their unique UUID
   */
  async findById(id) {
    const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Insert a new user (for completeness and future expansions)
   */
  async create({ id, name, email, password, role }) {
    const sql = `
      INSERT INTO users (id, name, email, password, role, is_enabled)
      VALUES ($1, $2, $3, $4, $5, 1)
      RETURNING id, name, email, role, is_enabled, created_at
    `;
    const result = await query(sql, [id, name, email, password, role]);
    return result.rows[0];
  }
};
