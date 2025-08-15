# HTTPS Mixed Content Fix Guide

## Problem
Your AWS Amplify frontend (HTTPS) is trying to connect to an Elastic Beanstalk backend (HTTP), causing a "Mixed Content" error.

## Current Status
- ❌ HTTPS is not configured on your Elastic Beanstalk environment
- ❌ Connection timeout on port 443 (HTTPS)
- ✅ HTTP connection works but blocked by browser security

## ⚠️ Temporary Revert
I've reverted the code to use HTTP temporarily, but you'll still get mixed content errors in production.

## 🚀 Solutions (Choose One)

### Solution 1: Configure HTTPS on Elastic Beanstalk (Recommended)

#### Step 1: Request SSL Certificate
1. Go to **AWS Certificate Manager (ACM)**
2. Click **Request a certificate**
3. Choose **Request a public certificate**
4. Add domain name: `xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com`
5. Choose **DNS validation** (easier) or **Email validation**
6. Click **Request**
7. Complete validation process

#### Step 2: Configure Load Balancer

#### Option A: Enable HTTPS Listener (Recommended)
1. Go to **Elastic Beanstalk Console**
2. Select your environment: `xen-ai-test-env`
3. Go to **Configuration** → **Load balancer**
4. Click **Edit**
5. Add HTTPS listener:
   - Protocol: HTTPS
   - Port: 443
   - SSL Certificate: Choose existing or create new

#### Option B: Use Application Load Balancer with ACM Certificate
1. **Request SSL Certificate in ACM:**
   - Go to AWS Certificate Manager
   - Request public certificate
   - Add domain: `xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com`
   - Validate certificate

2. **Configure Load Balancer:**
   - Add HTTPS listener with ACM certificate
   - Redirect HTTP to HTTPS (optional)

### 3. Update Backend CORS Configuration

Make sure your backend allows requests from your Amplify domain. In your backend code, update CORS settings:

```javascript
// In your backend server.js or similar file
app.use(cors({
  origin: [
    'http://localhost:5173',  // Development
    'https://master.d1rq2oraretrjj.amplifyapp.com',  // Your Amplify domain
    // Add any other domains you need
  ],
  credentials: true
}));
```

### 4. Set Environment Variable in Amplify

1. Go to **AWS Amplify Console**
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Add/Update:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com/api`

### 5. Test the Connection

After deploying:
1. Open your Amplify app
2. Try to register/login
3. Check browser console for any remaining errors

## Troubleshooting

### If HTTPS doesn't work on Elastic Beanstalk:
1. **Check SSL Certificate:** Ensure it's valid and properly configured
2. **Security Groups:** Make sure port 443 is open
3. **Health Checks:** Verify health checks are passing on HTTPS

### If you still get CORS errors:
1. Update backend CORS configuration
2. Ensure your Amplify domain is whitelisted
3. Check that credentials are properly handled

### Solution 2: Use CloudFront (Alternative)

If you can't configure HTTPS on Elastic Beanstalk:

#### Step 1: Create CloudFront Distribution
1. Go to **CloudFront Console**
2. Click **Create Distribution**
3. Configure:
   - **Origin Domain**: `xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com`
   - **Protocol**: HTTP Only (since your backend is HTTP)
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache Policy**: CachingDisabled (for API)

#### Step 2: Update Frontend
1. Wait for CloudFront deployment (15-20 minutes)
2. Update `VITE_API_BASE_URL` to your CloudFront domain
3. Example: `https://d1234567890.cloudfront.net/api`

### Solution 3: Quick Development Fix

For immediate testing, you can temporarily disable mixed content protection:

#### Chrome (Development Only):
1. Launch Chrome with: `--disable-web-security --user-data-dir=/tmp/chrome_dev`
2. **⚠️ WARNING**: Only use for development, never in production

#### Firefox (Development Only):
1. Go to `about:config`
2. Set `security.mixed_content.block_active_content` to `false`
3. **⚠️ WARNING**: Only use for development, never in production

## Security Best Practices

1. **Always use HTTPS in production**
2. **Restrict CORS to specific domains**
3. **Use environment variables for URLs**
4. **Keep SSL certificates updated**
5. **Monitor for mixed content warnings**

## Files Updated
- `src/context/AuthContext.jsx` - Updated default API URL to HTTPS
- `.env.production` - Updated environment variable
- `.env.example` - Updated example URL
