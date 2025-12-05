# 🚀 Render Deployment Guide for ConnectX Backend

## Quick Setup on Render

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your Git repository
4. Select the repository and branch

### 2. Configure Service

**Basic Settings:**
- **Name**: `connectx-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` (if repo root, or leave empty if backend is root)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables

Add these in Render Dashboard → Environment:

**Required:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=your_monthly_plan_id
RAZORPAY_PREMIUM_ANNUAL_PLAN_ID=your_annual_plan_id
FRONTEND_URL=https://your-frontend.vercel.app
BASE_URL=https://connectx-backend.onrender.com
```

**Optional:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=your_bucket
LOG_LEVEL=info
```

### 4. Database Setup

**Option 1: Render PostgreSQL**
1. Create PostgreSQL database in Render
2. Copy connection string to `DATABASE_URL`
3. Run migrations after first deploy

**Option 2: External Database**
- Use Supabase, Neon, or other PostgreSQL provider
- Add connection string to `DATABASE_URL`

### 5. Run Migrations

After first deployment, run migrations:

**Option 1: Via Render Shell**
1. Go to your service → **Shell**
2. Run:
```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

**Option 2: Via Local Machine**
```bash
# Set DATABASE_URL
export DATABASE_URL=your_production_db_url

# Run migrations
cd backend
npx prisma migrate deploy
npm run seed
```

### 6. Post-Deploy Script (Optional)

Create `render-build.sh`:
```bash
#!/bin/bash
npx prisma generate
npm run build
```

### 7. Health Check

Render automatically checks: `GET /`

### 8. Custom Domain (Optional)

1. Go to service → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed
4. Update `BASE_URL` environment variable

## Important Notes

### Render-Specific Settings

1. **Port**: Render uses `PORT` environment variable (defaults to 10000)
2. **Auto-Deploy**: Enabled by default on git push
3. **Build Timeout**: 45 minutes (should be enough)
4. **Sleep**: Free tier services sleep after 15 min inactivity

### Preventing Sleep (Free Tier)

- Use a monitoring service to ping your app
- Upgrade to paid plan for always-on

### Database Migrations

Run migrations after first deployment:
```bash
# In Render Shell or locally
npx prisma migrate deploy
npm run seed
```

### Environment Variables Security

- Mark sensitive variables as "Secret" in Render
- Never commit `.env` files
- Use Render's environment variable management

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies in `package.json`
- Ensure Node.js version is compatible

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Verify firewall rules

### Application Crashes
- Check logs in Render dashboard
- Verify all required environment variables are set
- Check database migrations are run

## Vercel Frontend Configuration

Update frontend `.env`:
```
VITE_API_URL=https://connectx-backend.onrender.com/api
```

## Deployment Checklist

- [ ] Repository connected to Render
- [ ] Service created and configured
- [ ] All environment variables added
- [ ] Database created and connected
- [ ] First deployment successful
- [ ] Migrations run
- [ ] Seed data loaded
- [ ] Health check passing
- [ ] Frontend API URL updated
- [ ] Custom domain configured (if needed)

---

**Your Backend URL**: `https://connectx-backend.onrender.com`
**Health Check**: `https://connectx-backend.onrender.com/`

