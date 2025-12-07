# 🚀 Quick Deploy Guide - Render (Backend) + Vercel (Frontend)

## ✅ Code Pushed to GitHub

Your code is now at: `https://github.com/Amaan2410-tars/connectx-backend.git`

---

## 🔧 Render Setup (Backend)

### Step 1: Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect GitHub repository: `Amaan2410-tars/connectx-backend`
4. Select branch: `main`

### Step 2: Configure Service
- **Name**: `connectx-backend`
- **Environment**: `Node`
- **Root Directory**: Leave empty (backend is root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 3: Add Environment Variables
Go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_32_chars
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=your_monthly_plan_id
RAZORPAY_PREMIUM_ANNUAL_PLAN_ID=your_annual_plan_id
FRONTEND_URL=https://your-frontend.vercel.app
BASE_URL=https://connectx-backend.onrender.com
LOG_LEVEL=info
```

### Step 4: Deploy
Click **Create Web Service** - Render will automatically deploy!

### Step 5: Run Migrations
After first deployment, go to **Shell** tab and run:
```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### Step 6: Get Your Backend URL
Your backend will be at: `https://connectx-backend.onrender.com`

---

## ⚡ Vercel Setup (Frontend)

### Step 1: Import Project
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import from GitHub: Your frontend repository
4. Select root directory: `frontend/neon-connectx-vibe-main`

### Step 2: Configure Build
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
Add in Vercel dashboard:

```
VITE_API_URL=https://connectx-backend.onrender.com/api
```

### Step 4: Deploy
Click **Deploy** - Vercel will automatically deploy!

### Step 5: Get Your Frontend URL
Your frontend will be at: `https://your-project.vercel.app`

---

## 🔄 Update Backend with Frontend URL

After Vercel deployment, update Render environment variable:

1. Go to Render dashboard
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy (or it will auto-redeploy)

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Health check working: `https://connectx-backend.onrender.com/`
- [ ] Frontend can connect to backend
- [ ] Legal pages accessible (for Razorpay)
- [ ] Authentication working
- [ ] Premium subscription tested

---

## 🔗 Important URLs

**Backend Health Check**: `https://connectx-backend.onrender.com/`

**Legal Pages (for Razorpay)**:
- Terms: `https://connectx-backend.onrender.com/api/legal/terms`
- Privacy: `https://connectx-backend.onrender.com/api/legal/privacy`
- Shipping: `https://connectx-backend.onrender.com/api/legal/shipping`
- Contact: `https://connectx-backend.onrender.com/api/legal/contact`
- Refunds: `https://connectx-backend.onrender.com/api/legal/refunds`

---

## 🆘 Troubleshooting

### Backend Issues
- Check Render logs
- Verify all environment variables are set
- Ensure database is accessible
- Run migrations if needed

### Frontend Issues
- Check Vercel build logs
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend

### Database Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from Render
- Run migrations: `npx prisma migrate deploy`

---

## 📝 Next Steps

1. **Set up Razorpay**:
   - Create plans in Razorpay dashboard
   - Configure webhooks
   - Add Plan IDs to Render environment

2. **Customize Legal Pages**:
   - Update content in `src/controllers/legal.controller.ts`
   - Update email addresses
   - Add business details

3. **Test Everything**:
   - Test authentication
   - Test premium subscription
   - Test coins system
   - Test all endpoints

---

**Your code is ready! Follow the steps above to deploy.** 🚀



