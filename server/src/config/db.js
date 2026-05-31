import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let sqliteDb = null;
let dbType = 'sqlite';

// Determine which database to use
if (env.DATABASE_URL || (env.PG.host && env.PG.user && env.PG.database)) {
  try {
    // Attempt PostgreSQL connection
    pool = new Pool({
      connectionString: env.DATABASE_URL || undefined,
      host: env.PG.host,
      port: env.PG.port,
      user: env.PG.user,
      password: env.PG.password,
      database: env.PG.database,
      ssl: { rejectUnauthorized: false }
    });
    dbType = 'postgres';
    console.log('🔌 DB: Configured for PostgreSQL');
  } catch (err) {
    console.error('⚠️ DB: Failed to configure PostgreSQL. Falling back to native SQLite. Error:', err.message);
    dbType = 'sqlite';
  }
} else {
  dbType = 'sqlite';
}

if (dbType === 'sqlite') {
  const dbPath = path.join(__dirname, '../../../database.sqlite');
  console.log(`🔌 DB: Using native SQLite fallback at ${dbPath}`);
  sqliteDb = new DatabaseSync(dbPath);
}

/**
 * Execute a query with params. Supports both Postgres ($1, $2) and SQLite.
 */
export const query = async (text, params = []) => {
  if (dbType === 'postgres') {
    const res = await pool.query(text, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount
    };
  } else {
    // SQLite: Transform Postgres parameters ($1, $2) to sequential ?
    const sqliteText = text.replace(/\$\d+/g, '?');
    const stmt = sqliteDb.prepare(sqliteText);

    // Check if query returns rows (SELECT or RETURNING)
    const isSelectOrReturning = /select|returning/i.test(sqliteText);

    if (isSelectOrReturning) {
      const rows = stmt.all(...params);
      return {
        rows,
        rowCount: rows.length
      };
    } else {
      const res = stmt.run(...params);
      return {
        rows: [],
        rowCount: res.changes
      };
    }
  }
};

/**
 * Initialize the database. For SQLite, this will run migrations and seed data automatically.
 */
export const initDb = async () => {
  if (dbType === 'postgres') {
    try {
      // Test PostgreSQL connection
      await pool.query('SELECT 1');
      console.log('✅ DB: PostgreSQL connection verified successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ DB: Failed to connect to PostgreSQL. Falling back to native SQLite. Error:', err.message);
      dbType = 'sqlite';

      const dbPath = path.join(__dirname, '../../../database.sqlite');
      console.log(`🔌 DB: Using native SQLite fallback at ${dbPath}`);
      sqliteDb = new DatabaseSync(dbPath);
      // Fall through to SQLite migrations and seeding
    }
  }

  // SQLite Initialization & Seeding
  try {
    // Check if tables already exist
    const checkTableQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name='users';";
    const checkStmt = sqliteDb.prepare(checkTableQuery);
    const tables = checkStmt.all();

    if (tables.length > 0) {
      console.log('✅ DB: SQLite tables already exist. Skipping seed.');
      return;
    }

    console.log('⚙️ DB: Setting up fresh SQLite database...');

    // 1. Read schema
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Adapt PostgreSQL schema syntax for SQLite
    schemaSql = schemaSql
      .replace(/DROP TABLE IF EXISTS (\w+) CASCADE/gi, 'DROP TABLE IF EXISTS $1') // SQLite doesn't support CASCADE in DROP TABLE
      .replace(/UUID/g, 'TEXT'); // SQLite uses TEXT for UUIDs

    // Remove comments and empty lines first
    const cleanSchemaSql = schemaSql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

    // Split SQL by semicolon and execute statements individually
    const statements = cleanSchemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      sqliteDb.exec(stmt);
    }
    console.log('📊 DB: SQLite Schema created successfully.');

    // 2. Read seed data
    const seedPath = path.join(__dirname, '../../../database/seed.sql');
    let seedSql = fs.readFileSync(seedPath, 'utf8');

    // Adapt PostgreSQL seed SQL for SQLite
    seedSql = seedSql
      .replace(/CURRENT_TIMESTAMP\s*-\s*INTERVAL\s*'(\d+)\s*day'/g, "datetime('now', '-$1 days')");

    // Remove comments and empty lines first
    const cleanSeedSql = seedSql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

    const seedStatements = cleanSeedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of seedStatements) {
      sqliteDb.exec(stmt);
    }
    console.log('🌱 DB: SQLite seeded successfully with demo users and requests.');

  } catch (err) {
    console.error('❌ DB: Failed to initialize SQLite database:', err);
  }
};
