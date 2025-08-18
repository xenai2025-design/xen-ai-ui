// Express app factory for serverless deployment
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import configRoutes from './routes/config.js';
import imageRoutes from './routes/image.js';
import storyRoutes from './routes/story.js';
import resumeRoutes from './routes/resume.js';
import contentRoutes from './routes/content.js';
import passport from './config/passport.js';
import configService from './services/configService.js';

// Load environment variables
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database and config
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;
  
  try {
    // Allow skipping DB init for local dev
    if (process.env.SKIP_DB_INIT === 'true') {
      isInitialized = true;
      console.log('✅ App initialized (DB init skipped via SKIP_DB_INIT=true)');
      return;
    }

    // Test database connection
    await testConnection();
    
    // Initialize database tables
    await initializeDatabase();
    
    // Initialize default configurations
    await configService.initializeDefaultConfigs();
    
    isInitialized = true;
    console.log('✅ Serverless app initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize serverless app:', error.message);
    throw error;
  }
};

// Create and configure Express app
export const createApp = async () => {
  // Initialize the app
  await initializeApp();
  
  const app = express();

  // Middleware
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174'
    ],
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve static files (generated images)
  app.use('/images', express.static(path.join(__dirname, 'public/images')));

  // Session middleware for OAuth
  app.use(session({
    secret: process.env.SESSION_SECRET || 'xen-ai-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Xen-AI Backend Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/story', storyRoutes);
  app.use('/api/resume', resumeRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/image', imageRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.originalUrl
    });
  });

  // Global error handler
  app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });

  return app;
};
