# Environment Variables Setup Guide

## Required Environment Variables

Copy these to your `.env` file:

```env
# ============================================
# Server Configuration
# ============================================
PORT=4000
NODE_ENV=production
BASE_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# ============================================
# Database Configuration (REQUIRED)
# ============================================
DATABASE_URL=postgresql://user:password@host:port/database

# ============================================
# JWT Configuration (REQUIRED)
# ============================================
# Generate with: openssl rand -base64 32
JWT_SECRET=your_jwt_secret_key_here_change_in_production_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_change_in_production_min_32_chars

# ============================================
# Razorpay Configuration (REQUIRED for Payments)
# ============================================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_monthly_id_here
RAZORPAY_PREMIUM_ANNUAL_PLAN_ID=plan_annual_id_here

# ============================================
# AWS S3 Configuration (Optional)
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_bucket_name

# ============================================
# Logging Configuration
# ============================================
LOG_LEVEL=info
```

## Generate Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32
```

## Razorpay Setup

1. Create account at https://razorpay.com
2. Get API keys from Dashboard → Settings → API Keys
3. Create plans:
   - Monthly: ₹29/month
   - Annual: ₹278/year
4. Copy Plan IDs to environment variables

