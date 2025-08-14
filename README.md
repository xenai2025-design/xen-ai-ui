# Xen-AI Application

A modern AI-powered application with authentication system built using React, Node.js, Express, and SQLite with Google OAuth integration.

## Features

- **Frontend**: React + Vite with Tailwind CSS
- **Backend**: Node.js + Express API
- **Database**: SQLite (local file-based database)
- **Authentication**: JWT-based authentication + Google OAuth 2.0
- **UI/UX**: Dark theme with orange accents, smooth animations
- **Security**: Password hashing, input validation, protected routes

## Project Structure

```
xen-ai-ui/
├── backend/                 # Node.js backend
│   ├── config/
│   │   ├── database.js     # SQLite configuration
│   │   └── passport.js     # Google OAuth configuration
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── models/
│   │   └── User.js         # User model
│   ├── routes/
│   │   └── auth.js         # Authentication routes
│   ├── .env                # Environment variables
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Express server
│   └── database.sqlite     # SQLite database file (auto-created)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   └── ...
│   ├── package.json        # Frontend dependencies
│   └── ...
├── GOOGLE_OAUTH_SETUP.md   # Google OAuth setup guide
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Console account (for OAuth)

### Backend Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Update the `backend/.env` file with your configuration:
   ```env
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   
   PORT=5000
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:5173
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # Session Configuration
   SESSION_SECRET=your_session_secret_here
   ```

3. **Setup Google OAuth (Optional but recommended):**
   Follow the detailed guide in `GOOGLE_OAUTH_SETUP.md`

4. **Start the backend server:**
   ```bash
   npm start
   ```
   
   The backend will be available at `http://localhost:5000`
   SQLite database will be automatically created at `backend/database.sqlite`

### Frontend Setup

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Traditional Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)
- `GET /api/auth/verify` - Verify JWT token (protected)

#### Google OAuth Routes
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/google/link` - Link Google account to existing user (protected)

### Health Check

- `GET /health` - Server health check

## Database Schema

### Users Table (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
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
);
```

## Authentication Flow

### Traditional Authentication
1. **Registration**: User creates account with username, email, and password
2. **Login**: User authenticates with email and password
3. **JWT Token**: Server returns JWT token on successful authentication
4. **Protected Routes**: Frontend stores token and includes it in API requests
5. **Token Verification**: Backend middleware verifies token for protected routes
6. **Logout**: Frontend removes token and redirects to login

### Google OAuth Flow
1. **OAuth Initiation**: User clicks "Continue with Google" button
2. **Google Authorization**: User authorizes app on Google's servers
3. **Callback Handling**: Google redirects back with authorization code
4. **Profile Creation**: Server creates/updates user profile with Google data
5. **JWT Token**: Server returns JWT token for authenticated session
6. **Frontend Redirect**: User is redirected to dashboard

## Security Features

- Password hashing using bcryptjs
- JWT token-based authentication
- Google OAuth 2.0 integration
- Input validation and sanitization
- Protected API routes
- CORS configuration
- SQL injection prevention with prepared statements
- Session management for OAuth flows

## Development

### Running in Development Mode

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`

### Building for Production

1. Build frontend: `npm run build`
2. The built files will be in the `dist` directory

### Deployment

#### AWS Amplify (Frontend Only)
For deploying the frontend to AWS Amplify, see the detailed guide: `AWS_AMPLIFY_DEPLOYMENT.md`

#### Full Stack Deployment
1. Deploy backend to your preferred hosting service (AWS EC2, Heroku, Railway, etc.)
2. Update the `VITE_API_BASE_URL` environment variable to point to your backend
3. Deploy frontend to AWS Amplify or your preferred static hosting service

## Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios
- Heroicons

### Backend
- Node.js
- Express.js
- SQLite3
- Passport.js (Google OAuth)
- bcryptjs
- jsonwebtoken
- express-validator
- express-session
- cors
- dotenv

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
