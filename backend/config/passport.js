import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { query } from './database.js';

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findByGoogleId(profile.id);
      
      if (user) {
        // User exists, return user
        return done(null, user);
      }
      
      // Check if user exists with same email
      user = await User.findByEmail(profile.emails[0].value);
      
      if (user) {
        // User exists with same email, link Google account
        const sql = 'UPDATE users SET google_id = ?, provider = ? WHERE id = ?';
        await query.run(sql, [profile.id, 'google', user.id]);
        
        // Get updated user
        user = await User.findById(user.id);
        return done(null, user);
      }
      
      // Create new user
      user = await User.createGoogleUser(profile);
      return done(null, user);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not found in environment variables');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
