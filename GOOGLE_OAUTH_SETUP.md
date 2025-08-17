# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth credentials for the Xen-AI application.

## Prerequisites
- Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `xen-ai-oauth` (or your preferred name)
5. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API" and click "Enable"
4. Also search for and enable "Google OAuth2 API"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: `Xen-AI`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Save and Continue" (default scopes are fine)
7. On the "Test users" page, add your email for testing
8. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Enter name: `Xen-AI Web Client`
5. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for development frontend)
   - `http://localhost:5000` (for development backend)
6. Add Authorized redirect URIs:
   - `https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api/auth/google/callback`
7. Click "Create"

### 5. Copy Credentials

1. After creating, you'll see a popup with your credentials
2. Copy the **Client ID** and **Client Secret**
3. You can also find these later in the Credentials page

### 6. Configure Environment Variables

1. In your `backend` directory, create a `.env` file (copy from `.env.example`)
2. Add your Google OAuth credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
GOOGLE_CALLBACK_URL=https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api/auth/google/callback
```

### 7. Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. Go to `http://localhost:5173/login`
4. Click "Continue with Google"
5. You should be redirected to Google's OAuth consent screen

## Production Setup

For production deployment, you'll need to:

1. Update the OAuth consent screen to "In production"
2. Add your production domain to authorized origins and redirect URIs
3. Update environment variables with production URLs
4. Use secure, randomly generated secrets for JWT_SECRET and SESSION_SECRET

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the callback URL in Google Console matches exactly: `https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api/auth/google/callback`
   - Check for trailing slashes or typos

2. **"access_blocked" error**
   - Make sure you've added your email as a test user in the OAuth consent screen
   - Verify the app is in "Testing" mode

3. **"invalid_client" error**
   - Double-check your Client ID and Client Secret in the .env file
   - Ensure there are no extra spaces or quotes

4. **CORS errors**
   - Verify your frontend URL is added to authorized JavaScript origins
   - Check that CORS is properly configured in your backend

### Testing Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Environment variables set
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Google login button appears on login page
- [ ] Clicking Google login redirects to Google
- [ ] After Google auth, redirects back to your app
- [ ] User is logged in successfully

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Monitor your Google Cloud Console for any suspicious activity

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check your backend server logs
3. Verify all URLs match exactly between Google Console and your code
4. Ensure all required APIs are enabled in Google Cloud Console
