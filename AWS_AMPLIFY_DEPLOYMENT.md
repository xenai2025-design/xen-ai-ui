# AWS Amplify Deployment Guide

This guide explains how to deploy the Xen-AI frontend to AWS Amplify.

## Prerequisites

1. AWS Account with Amplify access
2. GitHub repository with your code
3. Backend API deployed and accessible (separate from this frontend deployment)

## Files Added for Amplify Deployment

### 1. `amplify.yml` - Build Configuration
Defines the build process for AWS Amplify.

### 2. `public/_redirects` - SPA Routing
Ensures all routes redirect to `index.html` for client-side routing.

### 3. Updated `vite.config.js`
- Added proper build configuration
- Set `base: './'` for relative paths

### 4. Environment Variables Support
- `.env.example` - Template for environment variables
- `.env.production` - Production environment variables
- Updated `AuthContext.jsx` to use `VITE_API_BASE_URL`

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all the new files are committed to your repository:
   ```bash
   git add .
   git commit -m "Add AWS Amplify deployment configuration"
   git push origin main
   ```

### Step 2: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" > "Host web app"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository and branch (usually `main`)

### Step 3: Configure Build Settings

1. Amplify should auto-detect the `amplify.yml` file
2. If not, paste this build configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 4: Set Environment Variables

1. In Amplify Console, go to "App settings" > "Environment variables"
2. Add the following variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-domain.com/api`

**Important**: Replace `your-backend-domain.com` with your actual backend URL.

### Step 5: Deploy

1. Click "Save and deploy"
2. Wait for the build to complete
3. Your app will be available at the provided Amplify URL

## Troubleshooting

### "Unexpected token '<'" Error

This error occurs when:
1. The browser expects JavaScript but receives HTML (usually a 404 page)
2. Routes aren't properly configured for SPA

**Solutions**:
- Ensure `public/_redirects` file exists with the content: `/*    /index.html   200`
- Verify the build artifacts are in the `dist` directory
- Check that `baseDirectory: dist` is set in `amplify.yml`

### API Connection Issues

If the frontend can't connect to your backend:
1. Verify `VITE_API_BASE_URL` environment variable is set correctly
2. Ensure your backend allows CORS from your Amplify domain
3. Check that your backend is deployed and accessible

### Build Failures

Common build issues:
1. **Node version**: Ensure you're using a compatible Node.js version
2. **Dependencies**: Run `npm ci` locally to verify dependencies install correctly
3. **Environment variables**: Make sure all required variables are set in Amplify

## Backend Deployment

Note: This guide only covers frontend deployment. Your backend needs to be deployed separately to:
- AWS EC2
- AWS Lambda + API Gateway
- Heroku
- Railway
- Or any other hosting service

Update the `VITE_API_BASE_URL` environment variable to point to your deployed backend.

## Custom Domain (Optional)

1. In Amplify Console, go to "App settings" > "Domain management"
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update Google OAuth settings to include your custom domain

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Configure your backend to only allow requests from your Amplify domain
3. **HTTPS**: Amplify automatically provides HTTPS for your app
4. **OAuth**: Update Google OAuth settings with your production domain

## Monitoring

1. Use Amplify Console to monitor deployments
2. Check CloudWatch logs for any issues
3. Set up notifications for build failures
