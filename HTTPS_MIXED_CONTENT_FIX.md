# HTTPS Mixed Content Fix Guide

## Problem
Your AWS Amplify frontend (HTTPS) is trying to connect to an Elastic Beanstalk backend (HTTP), causing a "Mixed Content" error.

## ✅ Quick Fix Applied
I've updated your code to use HTTPS for the backend URL:
- Changed from: `http://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com/api`
- Changed to: `https://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com/api`

## Next Steps

### 1. Deploy Updated Frontend
```bash
git add .
git commit -m "Fix HTTPS mixed content issue"
git push origin main
```

### 2. Configure HTTPS on Elastic Beanstalk

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

### Alternative: Use CloudFront
If you can't enable HTTPS on Elastic Beanstalk:
1. Create CloudFront distribution
2. Point it to your Elastic Beanstalk environment
3. Enable HTTPS on CloudFront
4. Update `VITE_API_BASE_URL` to CloudFront URL

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
