# 🚀 ConnectX Backend - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Code Readiness
- [x] All TypeScript compilation errors fixed
- [x] All linter errors resolved
- [x] Database schema updated
- [x] All routes registered
- [x] Error handling implemented
- [x] Security middleware in place

### ⚠️ Required Actions Before Deployment

1. **Environment Variables** - Configure all required variables
2. **Database Migration** - Run migrations on production database
3. **Razorpay Setup** - Configure Razorpay plans and webhooks
4. **SSL/HTTPS** - Ensure HTTPS is enabled
5. **Domain Configuration** - Set up domain and DNS

---

## 🔧 Step 1: Environment Setup

### 1.1 Create Production `.env` File

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

### 1.2 Required Environment Variables

**Critical Variables (Must be set):**
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=strong_random_secret_min_32_chars
REFRESH_TOKEN_SECRET=strong_random_secret_min_32_chars
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=your_monthly_plan_id
RAZORPAY_PREMIUM_ANNUAL_PLAN_ID=your_annual_plan_id
FRONTEND_URL=https://your-frontend-domain.com
BASE_URL=https://your-backend-domain.com
```

**Generate Strong Secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 32
```

---

## 🗄️ Step 2: Database Setup

### 2.1 Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations on production database
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

### 2.2 Seed Initial Data

```bash
# Seed coin bundles
npm run seed
```

### 2.3 Verify Database Connection

Test the connection:
```bash
npx prisma studio
```

---

## 💳 Step 3: Razorpay Configuration

### 3.1 Create Razorpay Plans

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **Plans**
3. Create two plans:
   - **Monthly Plan**: ₹29/month
   - **Annual Plan**: ₹278/year (₹23.17/month)
4. Copy the Plan IDs and add to `.env`

### 3.2 Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-backend-domain.com/api/premium/webhook`
3. Enable events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.completed`
   - `subscription.cancelled`
4. Copy webhook secret (if provided)

### 3.3 Test Webhook

Use Razorpay's webhook testing tool to verify webhook delivery.

---

## 🌐 Step 4: Domain & SSL Setup

### 4.1 Domain Configuration

- Point your domain to your server IP
- Configure DNS records (A record or CNAME)

### 4.2 SSL Certificate

**Using Let's Encrypt (Free):**
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com
```

**Using Cloudflare:**
- Enable SSL/TLS in Cloudflare dashboard
- Set encryption mode to "Full" or "Full (strict)"

### 4.3 Update Environment Variables

```env
BASE_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🏗️ Step 5: Build & Deploy

### 5.1 Install Dependencies

```bash
npm ci --production
```

### 5.2 Build Application

```bash
npm run build
```

### 5.3 Start Application

**Option 1: Direct Start**
```bash
npm start
```

**Option 2: Using PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/server.js --name connectx-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

**Option 3: Using Docker**
```dockerfile
# Create Dockerfile (if not exists)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t connectx-backend .
docker run -d -p 4000:4000 --env-file .env connectx-backend
```

---

## 🔒 Step 6: Security Hardening

### 6.1 Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 6.2 Rate Limiting

Already configured in the application. Adjust if needed:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6.3 CORS Configuration

Ensure CORS is properly configured in `src/app.ts`:
```typescript
origin: process.env.FRONTEND_URL || false
```

### 6.4 Environment Variables Security

- Never commit `.env` to version control
- Use secrets management (AWS Secrets Manager, etc.)
- Rotate secrets regularly

---

## 📊 Step 7: Monitoring & Logging

### 7.1 Health Check Endpoint

Already available at: `GET /`

### 7.2 Logging

Logs are written to:
- Console (stdout)
- Winston logger (if configured)
- PM2 logs (if using PM2)

**View PM2 Logs:**
```bash
pm2 logs connectx-backend
```

### 7.3 Monitoring Tools

Consider setting up:
- **PM2 Monitoring**: `pm2 monit`
- **Application Insights**: New Relic, Datadog, etc.
- **Error Tracking**: Sentry, Rollbar, etc.

---

## ✅ Step 8: Verification

### 8.1 Test Endpoints

```bash
# Health check
curl https://your-backend-domain.com/

# Legal pages (required for Razorpay)
curl https://your-backend-domain.com/api/legal/terms
curl https://your-backend-domain.com/api/legal/privacy
curl https://your-backend-domain.com/api/legal/shipping
curl https://your-backend-domain.com/api/legal/contact
curl https://your-backend-domain.com/api/legal/refunds
```

### 8.2 Test Authentication

```bash
# Register user
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 8.3 Test Premium Subscription

```bash
# Subscribe (requires auth token)
curl -X POST https://your-backend-domain.com/api/premium/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType":"monthly"}'
```

---

## 🔄 Step 9: Maintenance

### 9.1 Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

### 9.2 Database Backups

Set up automated backups:
```bash
# PostgreSQL backup
pg_dump -h localhost -U user -d connectx_db > backup.sql
```

### 9.3 Log Rotation

Configure log rotation to prevent disk space issues.

---

## 🆘 Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check firewall rules

**2. Razorpay Webhook Not Working**
- Verify webhook URL is accessible
- Check webhook signature verification
- Review Razorpay dashboard logs

**3. CORS Errors**
- Verify `FRONTEND_URL` matches frontend domain
- Check CORS configuration in `app.ts`

**4. JWT Errors**
- Verify `JWT_SECRET` is set correctly
- Check token expiration settings

---

## 📞 Support

For deployment issues:
- Check application logs
- Review error messages
- Contact support: support@connectx.com

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all critical endpoints
2. ✅ Verify Razorpay integration
3. ✅ Test premium subscription flow
4. ✅ Verify legal pages are accessible
5. ✅ Monitor application logs
6. ✅ Set up error tracking
7. ✅ Configure automated backups

---

## 📝 Deployment Checklist Summary

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Razorpay plans created and configured
- [ ] Webhooks configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Application built and deployed
- [ ] Health check passing
- [ ] Legal pages accessible
- [ ] Authentication working
- [ ] Premium subscription tested
- [ ] Monitoring set up
- [ ] Backups configured

---

**Last Updated**: December 2024
**Version**: 2.0



