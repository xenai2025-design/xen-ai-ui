import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('📁 Connected to SQLite database at:', dbPath);
  }
});

// Promisify database methods for async/await usage
const dbRun = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Test database connection
const testConnection = async () => {
  try {
    await dbGet('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Check if column exists in table
const columnExists = async (tableName, columnName) => {
  try {
    const result = await dbAll(`PRAGMA table_info(${tableName})`);
    return result.some(column => column.name === columnName);
  } catch (error) {
    return false;
  }
};

// Check if password column allows NULL
const passwordAllowsNull = async () => {
  try {
    const result = await dbAll('PRAGMA table_info(users)');
    const passwordColumn = result.find(column => column.name === 'password');
    return passwordColumn && passwordColumn.notnull === 0; // 0 means NULL is allowed
  } catch (error) {
    return false;
  }
};

// Migrate users table to allow NULL passwords for OAuth users
const migrateUsersTable = async () => {
  try {
    console.log('🔄 Migrating users table to support OAuth...');

    // First, clean up any leftover migration tables
    try {
      await dbRun('DROP TABLE IF EXISTS users_new');
      console.log('🧹 Cleaned up any existing migration tables');
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    // Create new table with correct schema
    const createNewUsersTable = `
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        google_id TEXT UNIQUE,
        provider TEXT DEFAULT 'local',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await dbRun(createNewUsersTable);

    // Copy data from old table to new table, handling missing columns gracefully
    const googleIdExists = await columnExists('users', 'google_id');
    const providerExists = await columnExists('users', 'provider');

    let copyData;
    if (googleIdExists && providerExists) {
      // All columns exist, copy everything
      copyData = `
        INSERT INTO users_new (id, username, email, password, first_name, last_name, avatar_url, google_id, provider, is_active, created_at, updated_at)
        SELECT id, username, email, password, first_name, last_name, avatar_url, google_id, provider, is_active, created_at, updated_at
        FROM users
      `;
    } else {
      // Some columns missing, copy with defaults
      copyData = `
        INSERT INTO users_new (id, username, email, password, first_name, last_name, avatar_url, google_id, provider, is_active, created_at, updated_at)
        SELECT id, username, email, password, first_name, last_name, avatar_url, NULL, 'local', is_active, created_at, updated_at
        FROM users
      `;
    }

    await dbRun(copyData);

    // Drop old table and rename new table
    await dbRun('DROP TABLE users');
    await dbRun('ALTER TABLE users_new RENAME TO users');

    console.log('✅ Users table migrated successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    // Clean up on failure
    try {
      await dbRun('DROP TABLE IF EXISTS users_new');
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        google_id TEXT UNIQUE,
        provider TEXT DEFAULT 'local',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await dbRun(createUsersTable);
    console.log('✅ Users table created/verified successfully');

    // Check if we need to migrate the table structure
    const passwordNullable = await passwordAllowsNull();
    const googleIdExists = await columnExists('users', 'google_id');
    const providerExists = await columnExists('users', 'provider');

    // If password doesn't allow NULL or OAuth columns are missing, migrate
    if (!passwordNullable || !googleIdExists || !providerExists) {
      const migrationSuccess = await migrateUsersTable();
      if (!migrationSuccess) {
        throw new Error('Failed to migrate users table');
      }
    }

    // Create trigger for updated_at timestamp
    const createUpdateTrigger = `
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp
      AFTER UPDATE ON users
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `;

    await dbRun(createUpdateTrigger);
    console.log('✅ Update trigger created/verified successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Database query helpers
const query = {
  run: dbRun,
  get: dbGet,
  all: dbAll
};

export { db, query, testConnection, initializeDatabase, columnExists };
