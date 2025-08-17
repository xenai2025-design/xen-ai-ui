# Fix VPC Origin Issue for CloudFront

## 🔍 Problem
CloudFront can't reach your Elastic Beanstalk environment because it's in a private VPC or has restrictive network settings.

## 🕵️ Diagnosis Steps

### Step 1: Test Public Accessibility
```bash
# Test if your EB is publicly accessible
curl http://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com/api/health

# If this fails, your EB is not publicly accessible
```

### Step 2: Check Load Balancer Type
1. Go to **EC2 Console** → **Load Balancers**
2. Find your Elastic Beanstalk load balancer (usually named with your environment)
3. Check **Scheme**: Should be "internet-facing", not "internal"

### Step 3: Check Security Groups
1. **EC2 Console** → **Security Groups**
2. Find load balancer security group
3. Check inbound rules - should allow HTTP (port 80) from 0.0.0.0/0

## 🚀 Solutions

### Solution 1: Make Load Balancer Internet-Facing

1. **Go to Elastic Beanstalk Console**
2. Select environment: `xen-ai-test-env`
3. **Configuration** → **Network** → **Edit**
4. **Load balancer settings:**
   - **Visibility**: Public
   - **Subnets**: Select public subnets only
5. **Apply** (takes 5-10 minutes)

### Solution 2: Update Security Groups

1. **EC2 Console** → **Security Groups**
2. **Find EB Load Balancer Security Group**
3. **Edit Inbound Rules** → **Add Rule:**
   - Type: HTTP
   - Port: 80
   - Source: 0.0.0.0/0 (Anywhere)
   - Description: Allow CloudFront access

### Solution 3: Check VPC Configuration

1. **VPC Console** → **Subnets**
2. **Verify your EB subnets:**
   - Load balancer subnets should be **public** (have internet gateway route)
   - Instance subnets can be private

3. **Route Tables:**
   - Public subnets should have route to Internet Gateway (0.0.0.0/0 → igw-xxx)

## 🔧 Step-by-Step Fix

### Step 1: Identify the Issue
```bash
# Test current accessibility
curl -I http://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com

# Expected: HTTP 200 or 404 (connection works)
# Problem: Connection timeout or refused
```

### Step 2: Fix Network Configuration

**Option A: Through Elastic Beanstalk Console**
1. Environment → Configuration → Network
2. Load balancer visibility: **Public**
3. Load balancer subnets: **Select public subnets**
4. Apply changes

**Option B: Through EC2 Console**
1. Load Balancers → Find your EB LB
2. If scheme is "internal", you need to recreate as "internet-facing"
3. This requires EB environment recreation

### Step 3: Update Security Groups

```bash
# Find your load balancer security group ID
aws elbv2 describe-load-balancers --names your-eb-lb-name

# Add HTTP rule
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

### Step 4: Test and Verify

```bash
# Test accessibility
curl http://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com/api/health

# Should return your API response
```

### Step 5: Retry CloudFront Setup

Once EB is publicly accessible:
1. Delete failed CloudFront distribution (if any)
2. Create new CloudFront distribution
3. Use the working EB URL as origin

## 🚨 Common Issues

### "Internal" Load Balancer
- **Problem**: LB scheme is "internal"
- **Solution**: Recreate EB environment with public load balancer

### Private Subnets Only
- **Problem**: Load balancer in private subnets
- **Solution**: Move to public subnets or add NAT Gateway

### Security Group Restrictions
- **Problem**: Security group blocks HTTP traffic
- **Solution**: Add inbound rule for port 80 from 0.0.0.0/0

### No Internet Gateway
- **Problem**: VPC has no internet access
- **Solution**: Add Internet Gateway and update route tables

## 🎯 Quick Verification Checklist

- [ ] EB URL accessible from internet
- [ ] Load balancer scheme is "internet-facing"
- [ ] Load balancer in public subnets
- [ ] Security group allows HTTP (port 80) from anywhere
- [ ] Route table has internet gateway route
- [ ] No NACLs blocking traffic

## 💡 Alternative Solutions

### If You Can't Make EB Public:

1. **API Gateway + Lambda Proxy**
2. **Application Load Balancer in public subnet**
3. **NAT Gateway for private resources**
4. **VPC Peering or Transit Gateway**

## 🔄 After Fixing

Once your EB is publicly accessible:
1. Test with curl
2. Create CloudFront distribution
3. Update frontend to use CloudFront HTTPS URL
4. Mixed content issue resolved! 🎉
