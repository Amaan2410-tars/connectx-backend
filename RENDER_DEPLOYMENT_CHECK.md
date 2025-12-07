# 🔍 Render Deployment Diagnostic Checklist

## Issue: "APP IS RUNNING" Instead of Proper API

If Render is showing "APP IS RUNNING" instead of your API, follow these steps:

## Step 1: Verify Render Service Configuration

### Check These Settings in Render Dashboard:

1. **Service Type**: Should be "Web Service" (not Static Site)
2. **Environment**: Should be "Node"
3. **Root Directory**: Should be empty (or `backend` if repo root)
4. **Branch**: Should be `main` (or your default branch)

### Build & Start Commands:

**Build Command:**
```
npm install && npx prisma generate && npm run build
```

**Start Command:**
```
npm start
```

**Verify these are set correctly in Render Dashboard → Settings**

## Step 2: Check Render Logs

1. Go to Render Dashboard → Your Service → **Logs** tab
2. Look for:
   - ✅ "Server running on port XXXX"
   - ✅ "Environment: production"
   - ❌ Any errors about missing modules
   - ❌ Any errors about routes not found
   - ❌ Any build failures

## Step 3: Verify Deployment

### Check Deployment Status:
1. Go to Render Dashboard → Your Service
2. Check **Events** tab
3. Look for latest deployment:
   - Should show "Live"
   - Should show commit hash matching your latest push
   - Should show "Deployed successfully"

### If Deployment Failed:
- Check build logs
- Fix any errors
- Redeploy

## Step 4: Test Health Endpoint

After deployment, test:
```bash
curl https://connectx-backend.onrender.com/
```

**Expected Response:**
```json
{
  "success": true,
  "status": "ConnectX Backend is Running",
  "timestamp": "2024-12-05T..."
}
```

**If you see "APP IS RUNNING":**
- The wrong code is running
- Force redeploy with cache clear
- Check if there's another service running

## Step 5: Verify File Structure

In Render, check if these files exist:
- `dist/server.js` (should exist after build)
- `dist/app.js` (should exist after build)
- `dist/routes/` (should contain route files)

## Step 6: Check Environment Variables

Ensure these are set in Render:
- `NODE_ENV=production`
- `PORT=10000` (or let Render assign)
- `DATABASE_URL=your_database_url`
- `FRONTEND_URL=https://connectx-frontend.vercel.app`
- All other required variables

## Step 7: Force Complete Redeploy

1. **Clear Build Cache:**
   - Render Dashboard → Your Service → Manual Deploy
   - Check "Clear build cache"
   - Deploy

2. **Or Delete and Recreate:**
   - If nothing works, delete the service
   - Create new service from same repo
   - Configure all settings again

## Step 8: Verify Git Repository

Make sure Render is connected to the correct repo:
- Repository: `Amaan2410-tars/connectx-backend`
- Branch: `main`
- Root Directory: (empty, or `backend` if needed)

## Common Issues

### Issue 1: Wrong Service Type
- **Symptom**: "APP IS RUNNING" message
- **Fix**: Ensure it's "Web Service", not "Static Site"

### Issue 2: Wrong Start Command
- **Symptom**: Service starts but routes don't work
- **Fix**: Verify `npm start` runs `node dist/server.js`

### Issue 3: Build Not Completing
- **Symptom**: Build succeeds but app doesn't start
- **Fix**: Check build logs for warnings/errors

### Issue 4: Old Deployment
- **Symptom**: Changes not reflected
- **Fix**: Force redeploy with cache clear

## Quick Test After Fix

```bash
# Health check (should return JSON)
curl https://connectx-backend.onrender.com/

# Test signup (should work, not 404)
curl -X POST https://connectx-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"student"}'
```

## Still Not Working?

1. Check Render support documentation
2. Review Render logs thoroughly
3. Try creating a new service from scratch
4. Verify all environment variables
5. Check if there are multiple services with same name



