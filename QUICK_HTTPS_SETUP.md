# Quick HTTPS Setup for Elastic Beanstalk

## 🎯 Goal
Enable HTTPS on your Elastic Beanstalk environment to fix the mixed content error.

## 📋 Prerequisites
- AWS Console access
- Your Elastic Beanstalk environment: `xen-ai-test-env`

## 🚀 Step-by-Step Instructions

### Step 1: Request SSL Certificate (5 minutes)

1. **Go to AWS Certificate Manager (ACM)**
   - Search "Certificate Manager" in AWS Console
   - Make sure you're in the **same region** as your Elastic Beanstalk (ap-northeast-1)

2. **Request Certificate**
   - Click "Request a certificate"
   - Choose "Request a public certificate"
   - Domain name: `xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com`
   - Validation method: "DNS validation" (recommended)
   - Click "Request"

3. **Complete Validation**
   - Click on your certificate
   - Click "Create record in Route 53" (if you use Route 53)
   - Or manually add the CNAME record to your DNS provider
   - Wait for status to change to "Issued" (can take a few minutes)

### Step 2: Configure Load Balancer (5 minutes)

1. **Go to Elastic Beanstalk Console**
   - Navigate to your environment: `xen-ai-test-env`
   - Click "Configuration" in the left sidebar

2. **Edit Load Balancer**
   - Find "Load balancer" section
   - Click "Edit"

3. **Add HTTPS Listener**
   - In the "Listeners" section, click "Add listener"
   - Port: 443
   - Protocol: HTTPS
   - SSL certificate: Select your certificate from ACM
   - Click "Apply"

4. **Wait for Deployment**
   - This will take 5-10 minutes
   - Environment health will show "Updating"

### Step 3: Test HTTPS Connection

1. **Test Backend Directly**
   ```bash
   curl https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api/health
   ```

2. **If it works, update your frontend:**
   - Set environment variable in Amplify: `VITE_API_BASE_URL=https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api`
   - Or update the code and redeploy

### Step 4: Update Frontend

1. **Option A: Environment Variable (Recommended)**
   - Go to AWS Amplify Console
   - Your app → App settings → Environment variables
   - Add: `VITE_API_BASE_URL=https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api`
   - Redeploy

2. **Option B: Code Update**
   ```javascript
   // In src/context/AuthContext.jsx
   const API_BASE_URL = 'https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api';
   ```

## 🔍 Troubleshooting

### Certificate Issues
- **"Pending validation"**: Complete DNS validation
- **"Failed"**: Check domain name spelling
- **"Expired"**: Request a new certificate

### Load Balancer Issues
- **Health check failing**: Ensure your app responds on port 80
- **502 Bad Gateway**: Check application logs
- **Timeout**: Verify security groups allow port 443

### Still Getting Mixed Content?
- Clear browser cache
- Check browser console for exact error
- Verify HTTPS URL is working in a new tab

## 🎉 Success!
Once HTTPS is working, your Amplify frontend will be able to connect to your backend without mixed content errors.

## 💡 Alternative: CloudFront
If the above doesn't work, you can use CloudFront as a proxy:
1. Create CloudFront distribution
2. Origin: Your HTTP Elastic Beanstalk URL
3. Viewer Protocol: Redirect HTTP to HTTPS
4. Use CloudFront URL in your frontend

## 📞 Need Help?
If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify certificate is in "Issued" status
3. Ensure load balancer listener is configured correctly
4. Test HTTPS endpoint directly before updating frontend
