# 🚀 Production Deployment Checklist

## Pre-Deployment

### Code Readiness
- [x] TypeScript compilation successful
- [x] No linter errors
- [x] All routes registered
- [x] Error handling implemented
- [x] Security middleware in place

### Database
- [x] Schema updated with premium and coins
- [x] Migrations created
- [ ] Migrations run on production database
- [ ] Coin bundles seeded

### Environment Variables
- [ ] `.env` file created with all variables
- [ ] Strong JWT secrets generated
- [ ] Razorpay credentials configured
- [ ] Database URL configured
- [ ] Frontend URL configured

### Razorpay Setup
- [ ] Razorpay account created
- [ ] API keys obtained
- [ ] Monthly plan created (₹29)
- [ ] Annual plan created (₹278)
- [ ] Plan IDs added to `.env`
- [ ] Webhook URL configured
- [ ] Webhook events enabled

### Domain & SSL
- [ ] Domain purchased/configured
- [ ] DNS records set up
- [ ] SSL certificate installed
- [ ] HTTPS working

## Deployment Steps

### 1. Server Setup
- [ ] Server provisioned
- [ ] Node.js installed (v18+)
- [ ] PostgreSQL installed/configured
- [ ] Firewall configured
- [ ] PM2 installed (optional)

### 2. Application Deployment
- [ ] Code cloned/pushed to server
- [ ] Dependencies installed (`npm ci --production`)
- [ ] Environment variables configured
- [ ] Application built (`npm run build`)
- [ ] Application started

### 3. Database Setup
- [ ] Production database created
- [ ] Migrations run (`npx prisma migrate deploy`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Seed data loaded (`npm run seed`)

### 4. Verification
- [ ] Health check endpoint working (`GET /`)
- [ ] Legal pages accessible
- [ ] Authentication working
- [ ] Premium subscription flow tested
- [ ] Webhook receiving events

## Post-Deployment

### Monitoring
- [ ] Logs configured
- [ ] Error tracking set up
- [ ] Uptime monitoring configured
- [ ] Performance monitoring enabled

### Security
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Secrets rotated
- [ ] Regular backups scheduled

### Documentation
- [ ] API documentation updated
- [ ] Deployment guide reviewed
- [ ] Team trained on deployment process

## Quick Commands

```bash
# Build
npm run build

# Start
npm start

# With PM2
pm2 start dist/server.js --name connectx-backend

# Database
npx prisma generate
npx prisma migrate deploy
npm run seed

# Health Check
curl https://your-domain.com/
```

