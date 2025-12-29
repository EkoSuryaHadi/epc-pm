# 🚀 Quick Start: Deploy to Cloudflare + Supabase

**Fastest way to deploy your EPC Project Management System**

---

## 📋 **What You'll Deploy**

- ✅ **Frontend:** Cloudflare Pages (Next.js with SSR)
- ✅ **Backend:** Railway (NestJS API)  
- ✅ **Database:** Supabase PostgreSQL

**Total Time:** ~30 minutes  
**Total Cost:** ~$5/month (Railway only, others are FREE!)

---

## 🎯 **Step-by-Step Deployment**

### **STEP 1: Setup Supabase Database** (10 minutes)

1. **Go to [Supabase.com](https://supabase.com)** → Sign in with GitHub

2. **Create New Project:**
   - Name: `epc-project-management`
   - Database Password: (generate strong password - **SAVE THIS!**)
   - Region: Singapore (or closest to you)
   - Plan: **Free**

3. **Wait 2-3 minutes** for database to initialize

4. **Get Connection Strings:**
   - Go to **Project Settings** → **Database**
   - Copy **Connection string** (URI format)
   - You'll get something like:
     ```
     postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```

5. **Save TWO connection strings:**
   ```bash
   # Pooler (for app)
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   
   # Direct (for migrations)
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```

6. **Run Migrations from Your Computer:**
   ```bash
   cd backend
   
   # Create .env file
   echo 'DATABASE_URL="your-pooler-connection-string"' > .env
   echo 'DIRECT_URL="your-direct-connection-string"' >> .env
   
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database
   npm run prisma:seed
   ```

7. **Verify in Supabase:**
   - Go to **Table Editor**
   - You should see 14 tables (users, projects, wbs, etc.)

✅ **Database Ready!**

---

### **STEP 2: Deploy Backend to Railway** (10 minutes)

1. **Go to [Railway.app](https://railway.app)** → Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `EkoSuryaHadi/epc-pm`

3. **Configure Service:**
   - Click on the service
   - Go to **Settings**
   - Set **Root Directory:** `backend`
   - Set **Start Command:** `npx prisma migrate deploy && npm run start:prod`

4. **Add Environment Variables:**
   - Go to **Variables** tab
   - Add these variables:
   
   ```bash
   DATABASE_URL=your-supabase-pooler-url
   DIRECT_URL=your-supabase-direct-url
   JWT_SECRET=generate-a-random-32-character-secret
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://epc-project-management.pages.dev
   ```

   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy:**
   - Railway will auto-deploy
   - Wait 3-5 minutes

6. **Get Your Backend URL:**
   - Go to **Settings** → **Networking**
   - Click "Generate Domain"
   - You'll get: `https://epc-backend-production-xxxx.up.railway.app`
   - **SAVE THIS URL!**

7. **Test Backend:**
   ```bash
   # Test API
   curl https://your-backend-url.railway.app/api
   
   # Should return: "EPC Project Control API"
   ```

✅ **Backend Deployed!**

---

### **STEP 3: Deploy Frontend to Cloudflare Pages** (10 minutes)

1. **Go to [Cloudflare Dashboard](https://dash.cloudflare.com)**

2. **Navigate to Pages:**
   - Click "Workers & Pages" in sidebar
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub:**
   - Authorize Cloudflare
   - Select repository: `EkoSuryaHadi/epc-pm`

4. **Configure Build:**
   ```
   Project name: epc-project-management
   Production branch: main
   Framework preset: Next.js
   Build command: cd frontend && npm install && npm run build
   Build output directory: frontend/.next
   Root directory: (leave empty)
   ```

5. **Environment Variables:**
   Add these variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXTAUTH_URL=https://epc-project-management.pages.dev
   NEXTAUTH_SECRET=same-as-jwt-secret-or-generate-new
   NODE_VERSION=18
   ```

6. **Click "Save and Deploy"**

7. **Wait for Build** (3-5 minutes)

8. **Get Your Frontend URL:**
   - After build completes: `https://epc-project-management.pages.dev`

✅ **Frontend Deployed!**

---

### **STEP 4: Update CORS** (2 minutes)

Backend needs to allow requests from Cloudflare Pages:

1. **Update Railway Environment Variables:**
   ```bash
   FRONTEND_URL=https://epc-project-management.pages.dev
   ```

2. **Redeploy Backend** (automatic after env change)

---

### **STEP 5: Test Everything!** (5 minutes)

1. **Open Your App:**
   ```
   https://epc-project-management.pages.dev
   ```

2. **Login:**
   - Email: `admin@epc.com`
   - Password: `admin123`

3. **Test Features:**
   - ✅ Dashboard loads
   - ✅ Projects page works
   - ✅ Create new project
   - ✅ No errors in browser console

4. **Check API:**
   ```
   https://your-backend-url.railway.app/api/docs
   ```

✅ **Everything Working!**

---

## 🎉 **You're Live!**

Your app is now deployed:

- **Frontend:** https://epc-project-management.pages.dev
- **Backend:** https://your-backend-url.railway.app
- **Database:** Supabase PostgreSQL
- **Cost:** ~$5/month (Railway only)

---

## 🔧 **Common Issues & Fixes**

### Issue 1: Build Fails on Cloudflare

**Error:** `Module not found` or `Build failed`

**Fix:**
```bash
# Update build command to:
cd frontend && npm ci && npm run build
```

### Issue 2: CORS Error

**Error:** `Access-Control-Allow-Origin` error in browser

**Fix:**
1. Check `FRONTEND_URL` in Railway matches your Cloudflare URL
2. Redeploy backend after changing env vars

### Issue 3: Can't Login

**Error:** `Invalid credentials` or API not responding

**Fix:**
1. Verify backend is running: `https://your-backend-url.railway.app/api`
2. Check `NEXT_PUBLIC_API_URL` in Cloudflare Pages
3. Ensure database was seeded

### Issue 4: Database Connection Error

**Error:** `Can't reach database server`

**Fix:**
1. Check Supabase database is running
2. Verify `DATABASE_URL` and `DIRECT_URL` are correct
3. Ensure connection string includes `?pgbouncer=true&connection_limit=1`

---

## 📞 **Need Help?**

1. Check deployment logs:
   - **Cloudflare:** Pages dashboard → Deployments → View logs
   - **Railway:** Service → Deployments → Click latest → View logs

2. Test each component:
   - Database: `npx prisma studio` (local)
   - Backend: `curl https://backend-url/api`
   - Frontend: Open in browser

3. Common fixes:
   - Clear browser cache
   - Redeploy after env changes
   - Check all URLs are correct

---

## 🚀 **Next Steps**

- [ ] Add custom domain to Cloudflare Pages
- [ ] Setup error tracking (Sentry)
- [ ] Configure database backups
- [ ] Add monitoring (UptimeRobot)
- [ ] Setup CI/CD for auto-deploy

---

**Congratulations! Your EPC Project Management System is live! 🎊**

---

**Last Updated:** 2025-12-29
