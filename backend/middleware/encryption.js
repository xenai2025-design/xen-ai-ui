import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Use environment variable for encryption key, fallback to default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'xen-ai-default-key-change-in-production-32-chars';
const ALGORITHM = 'aes-256-cbc';

// Ensure key is exactly 32 bytes for AES-256
const normalizeKey = (key) => {
  if (key.length === 32) return key;
  if (key.length > 32) return key.substring(0, 32);
  return key.padEnd(32, '0');
};

const NORMALIZED_KEY = normalizeKey(ENCRYPTION_KEY);

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV prepended
 */
export const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(NORMALIZED_KEY), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend IV to encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text with IV prepended
 * @returns {string} - Decrypted text
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(NORMALIZED_KEY), iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash data for comparison (one-way)
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
export const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate a secure random key
 * @param {number} length - Key length in bytes
 * @returns {string} - Random key in hex format
 */
export const generateKey = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export default {
  encrypt,
  decrypt,
  hash,
  generateKey
};
