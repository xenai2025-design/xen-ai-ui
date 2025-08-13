import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(userData) {
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.avatar_url = userData.avatar_url;
  }

  // Hash password before saving
  async hashPassword() {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Create new user
  async save() {
    try {
      // Only hash password for local users
      if (this.password) {
        await this.hashPassword();
      }
      
      const sql = `
        INSERT INTO users (username, email, password, first_name, last_name, avatar_url, google_id, provider)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await query.run(sql, [
        this.username,
        this.email,
        this.password || null,
        this.first_name || null,
        this.last_name || null,
        this.avatar_url || null,
        this.google_id || null,
        this.provider || 'local'
      ]);
      
      return result.lastID;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
      const result = await query.get(sql, [email]);
      return result || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
      const result = await query.get(sql, [username]);
      return result || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const sql = 'SELECT id, username, email, first_name, last_name, avatar_url, created_at FROM users WHERE id = ? AND is_active = 1';
      const result = await query.get(sql, [id]);
      return result || null;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.first_name !== undefined) {
        fields.push('first_name = ?');
        values.push(updateData.first_name);
      }
      
      if (updateData.last_name !== undefined) {
        fields.push('last_name = ?');
        values.push(updateData.last_name);
      }
      
      if (updateData.avatar_url !== undefined) {
        fields.push('avatar_url = ?');
        values.push(updateData.avatar_url);
      }
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(id);
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      const result = await query.run(sql, values);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const sql = 'SELECT id FROM users WHERE email = ?';
      const result = await query.get(sql, [email]);
      return result !== undefined;
    } catch (error) {
      throw error;
    }
  }

  // Check if username exists
  static async usernameExists(username) {
    try {
      const sql = 'SELECT id FROM users WHERE username = ?';
      const result = await query.get(sql, [username]);
      return result !== undefined;
    } catch (error) {
      throw error;
    }
  }

  // Find user by Google ID
  static async findByGoogleId(googleId) {
    try {
      const sql = 'SELECT * FROM users WHERE google_id = ? AND is_active = 1';
      const result = await query.get(sql, [googleId]);
      return result || null;
    } catch (error) {
      throw error;
    }
  }

  // Create Google OAuth user
  static async createGoogleUser(profile) {
    try {
      const user = new User({
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
        email: profile.emails[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        avatar_url: profile.photos[0]?.value,
        google_id: profile.id,
        provider: 'google'
      });

      const userId = await user.save();
      return await User.findById(userId);
    } catch (error) {
      throw error;
    }
  }
}

export default User;
