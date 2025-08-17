# CloudFront HTTPS Setup for Elastic Beanstalk

## 🎯 Goal
Create an HTTPS endpoint for your HTTP Elastic Beanstalk backend using CloudFront.

## ⏱️ Time Required
- Setup: 5 minutes
- Deployment: 15-20 minutes (AWS propagation)

## 📋 Step-by-Step Instructions

### Step 1: Create CloudFront Distribution

1. **Go to CloudFront Console**
   - Search "CloudFront" in AWS Console
   - Make sure you're in any region (CloudFront is global)

2. **Create Distribution**
   - Click "Create Distribution"
   - Choose "Web" distribution

3. **Origin Settings**
   - **Origin Domain**: `xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com`
   - **Origin Path**: `/api` (important!)
   - **Origin Protocol Policy**: HTTP Only
   - **Origin Request Headers**: None needed

4. **Default Cache Behavior**
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache Policy**: CachingDisabled
   - **Origin Request Policy**: CORS-S3Origin (or create custom)
   - **Response Headers Policy**: None

5. **Distribution Settings**
   - **Price Class**: Use All Edge Locations (or choose based on your needs)
   - **Alternate Domain Names**: Leave empty (using CloudFront domain)
   - **SSL Certificate**: Default CloudFront Certificate

6. **Create Distribution**
   - Click "Create Distribution"
   - Note the CloudFront domain (e.g., `d1234567890.cloudfront.net`)

### Step 2: Wait for Deployment

- Status will show "In Progress"
- Takes 15-20 minutes to deploy globally
- Status will change to "Deployed" when ready

### Step 3: Test CloudFront Endpoint

Once deployed, test your endpoint:

```bash
# Test health endpoint (replace with your CloudFront domain)
curl https://d1234567890.cloudfront.net/health

# Should return your API response
```

### Step 4: Update Frontend Configuration

1. **Update AWS Amplify Environment Variable:**
   - Go to Amplify Console → Your app → Environment variables
   - Update `VITE_API_BASE_URL` to: `https://d1234567890.cloudfront.net`
   - **Note**: No `/api` suffix needed (it's in the origin path)

2. **Or Update Code Directly:**
   ```javascript
   // In src/context/AuthContext.jsx
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://d1234567890.cloudfront.net';
   ```

3. **Redeploy Frontend**

### Step 5: Test Complete Flow

1. Open your Amplify app
2. Try to register/login
3. Check browser console - no more mixed content errors!

## 🔧 Troubleshooting

### CloudFront Returns 502 Bad Gateway
- Check origin domain spelling
- Verify Elastic Beanstalk is responding on HTTP
- Check origin path is set to `/api`

### CORS Errors
- Update your backend CORS settings to allow CloudFront domain
- Or use wildcard for development: `*`

### Cache Issues
- CloudFront might cache responses
- Use "CachingDisabled" policy for API endpoints
- Or create custom cache policy with short TTL

### Still Getting Mixed Content
- Verify CloudFront domain uses HTTPS
- Check environment variable is updated
- Clear browser cache

## 🎉 Benefits of CloudFront Solution

- ✅ **Free HTTPS** - No certificate management needed
- ✅ **Global CDN** - Faster API responses worldwide
- ✅ **DDoS Protection** - Built-in AWS Shield
- ✅ **No Backend Changes** - Your EB stays HTTP
- ✅ **Easy Setup** - No domain ownership required

## 📊 Expected Results

**Before:**
```
Frontend (HTTPS) → Backend (HTTP) = ❌ Mixed Content Error
```

**After:**
```
Frontend (HTTPS) → CloudFront (HTTPS) → Backend (HTTP) = ✅ Works!
```

## 💡 Pro Tips

1. **Monitor Costs**: CloudFront has usage-based pricing
2. **Custom Policies**: Create custom cache policies for better control
3. **Logging**: Enable CloudFront logs for debugging
4. **Multiple Origins**: You can add multiple backends later

## 🔄 Alternative: Custom Domain

If you have your own domain:
1. Add CNAME: `api.yourdomain.com` → CloudFront domain
2. Request ACM certificate for `api.yourdomain.com`
3. Update CloudFront to use custom domain + certificate
4. Use `https://api.yourdomain.com` in your frontend
