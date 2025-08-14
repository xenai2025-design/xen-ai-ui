import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL database configuration
const dbConfig = {
  host: 'srv945.hstgr.io',
  port: 3306,
  user: 'u307442259_node',
  password: '1ti36~$Q$+M',
  database: 'u307442259_node',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    console.log('✅ MySQL database connected successfully');
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table (MySQL syntax)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        avatar_url TEXT,
        google_id VARCHAR(255) UNIQUE,
        provider VARCHAR(50) DEFAULT 'local',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createUsersTable);
    console.log('✅ Users table created/verified successfully');
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Database query helpers
const query = {
  run: async (sql, params = []) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      connection.release();
      return { 
        lastID: result.insertId, 
        changes: result.affectedRows,
        result 
      };
    } catch (error) {
      connection.release();
      throw error;
    }
  },
  
  get: async (sql, params = []) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      connection.release();
      throw error;
    }
  },
  
  all: async (sql, params = []) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      connection.release();
      return rows;
    } catch (error) {
      connection.release();
      throw error;
    }
  }
};

export { pool as db, query, testConnection, initializeDatabase };
