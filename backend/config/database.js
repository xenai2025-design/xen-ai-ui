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
    
    // Create AI model configurations table
    const createAIModelConfigsTable = `
      CREATE TABLE IF NOT EXISTS ai_model_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_name VARCHAR(255) UNIQUE NOT NULL,
        provider VARCHAR(100) NOT NULL,
        model_name VARCHAR(255) NOT NULL,
        endpoint_url TEXT NOT NULL,
        api_key_encrypted TEXT NOT NULL,
        model_params JSON,
        system_prompt TEXT,
        max_tokens INT DEFAULT 1000,
        temperature DECIMAL(3,2) DEFAULT 0.70,
        is_active BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_provider (provider),
        INDEX idx_active (is_active),
        INDEX idx_default (is_default)
      )
    `;
    
    await connection.execute(createAIModelConfigsTable);
    console.log('✅ AI Model Configs table created/verified successfully');
    
    // Create app configurations table for general settings
    const createAppConfigsTable = `
      CREATE TABLE IF NOT EXISTS app_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(255) UNIQUE NOT NULL,
        config_value TEXT,
        config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        is_sensitive BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (config_key),
        INDEX idx_active (is_active)
      )
    `;
    
    await connection.execute(createAppConfigsTable);
    console.log('✅ App Configs table created/verified successfully');
    
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
