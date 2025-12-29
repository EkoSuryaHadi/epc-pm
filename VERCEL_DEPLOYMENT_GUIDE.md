# 🚀 Vercel Deployment Guide - Step by Step

## ✅ **STEP 1: Deploy Frontend ke Vercel**

### **A. Login ke Vercel**

1. **Buka browser** → Go to **[vercel.com](https://vercel.com)**

2. **Click "Sign Up"** (jika belum punya akun) atau **"Login"**

3. **Login dengan GitHub:**
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub

✅ **Logged in!**

---

### **B. Import Repository**

1. **Click "Add New..."** (tombol di kanan atas)

2. **Select "Project"**

3. **Import Git Repository:**
   - Cari repository: `EkoSuryaHadi/epc-pm`
   - Click **"Import"**

4. **Vercel akan auto-detect Next.js!**

---

### **C. Configure Project**

Vercel akan menampilkan configuration screen:

#### **Project Settings:**
```
Project Name: epc-project (atau nama yang Anda mau)
Framework Preset: Next.js (auto-detected ✅)
Root Directory: frontend
```

**IMPORTANT:** Click **"Edit"** di Root Directory, lalu pilih **`frontend`**

#### **Build Settings:**
```
Build Command: npm run build (default - jangan ubah)
Output Directory: .next (default - jangan ubah)
Install Command: npm install (default - jangan ubah)
```

---

### **D. Add Environment Variables**

**PENTING:** Sebelum deploy, tambahkan environment variables!

1. **Scroll ke bawah** ke section **"Environment Variables"**

2. **Click "Add"** dan masukkan 3 variables ini:

#### **Variable 1: NEXT_PUBLIC_API_URL**
```
Name: NEXT_PUBLIC_API_URL
Value: https://epc-backend-production.up.railway.app
```
**NOTE:** Ganti dengan URL backend Railway Anda yang sebenarnya!

#### **Variable 2: NEXTAUTH_URL**
```
Name: NEXTAUTH_URL
Value: https://epc-project.vercel.app
```
**NOTE:** Ganti `epc-project` dengan nama project Anda di Vercel

#### **Variable 3: NEXTAUTH_SECRET**
```
Name: NEXTAUTH_SECRET
Value: (generate random 32 characters)
```

**Generate NEXTAUTH_SECRET:**

Buka terminal/PowerShell dan run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output dan paste sebagai value.

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### **E. Deploy!**

1. **Click "Deploy"** (tombol biru besar)

2. **Wait 2-3 minutes** untuk build process

3. **Watch the logs** - Anda akan lihat:
   - Installing dependencies...
   - Building...
   - Uploading...
   - Deploying...

4. **Success!** 🎉

---

### **F. Get Your URL**

Setelah deployment selesai:

1. **Vercel akan show:**
   ```
   🎉 Congratulations!
   Your project is live at:
   https://epc-project.vercel.app
   ```

2. **Click "Visit"** untuk test

3. **SAVE THIS URL!** Anda akan perlu ini untuk backend CORS

---

## ✅ **STEP 2: Deploy Backend ke Railway**

### **A. Create Railway Account**

1. **Go to [railway.app](https://railway.app)**

2. **Click "Login"** → **"Login with GitHub"**

3. **Authorize Railway**

---

### **B. Create New Project**

1. **Click "New Project"**

2. **Select "Deploy from GitHub repo"**

3. **Choose:** `EkoSuryaHadi/epc-pm`

4. **Railway will create a service**

---

### **C. Configure Backend Service**

1. **Click on the service** (akan ada card dengan nama repo)

2. **Go to Settings:**
   - Click **"Settings"** tab
   - Scroll to **"Root Directory"**
   - Set to: `backend`
   - Click **"Update"**

3. **Set Start Command:**
   - Scroll to **"Start Command"**
   - Set to: `npx prisma migrate deploy && npm run start:prod`
   - Click **"Update"**

---

### **D. Add Environment Variables**

1. **Click "Variables" tab**

2. **Add these variables** (click "+ New Variable" untuk setiap variable):

#### **DATABASE_URL** (from Supabase)
```
Name: DATABASE_URL
Value: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

#### **DIRECT_URL** (from Supabase)
```
Name: DIRECT_URL
Value: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

#### **JWT_SECRET**
```
Name: JWT_SECRET
Value: (generate random 32 characters - same command as NEXTAUTH_SECRET)
```

#### **PORT**
```
Name: PORT
Value: 3001
```

#### **NODE_ENV**
```
Name: NODE_ENV
Value: production
```

#### **FRONTEND_URL**
```
Name: FRONTEND_URL
Value: https://epc-project.vercel.app
```
**NOTE:** Ganti dengan URL Vercel Anda yang sebenarnya!

---

### **E. Deploy Backend**

1. **Railway will auto-deploy** setelah Anda add variables

2. **Wait 3-5 minutes** untuk build

3. **Check logs:**
   - Click **"Deployments"** tab
   - Click latest deployment
   - Watch logs untuk errors

---

### **F. Generate Domain**

1. **Go to Settings** → **"Networking"**

2. **Click "Generate Domain"**

3. **Railway will give you:**
   ```
   https://epc-backend-production-xxxx.up.railway.app
   ```

4. **SAVE THIS URL!**

---

## ✅ **STEP 3: Setup Supabase Database**

### **A. Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**

2. **Login with GitHub**

3. **Click "New Project"**

4. **Fill in:**
   - Name: `epc-project-management`
   - Database Password: (generate strong password - **SAVE THIS!**)
   - Region: Singapore (or closest to you)
   - Plan: **Free**

5. **Click "Create new project"**

6. **Wait 2-3 minutes**

---

### **B. Get Connection Strings**

1. **Go to Project Settings** (gear icon)

2. **Click "Database"** in sidebar

3. **Scroll to "Connection string"**

4. **Select "URI" tab**

5. **Copy connection string:**
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

6. **Replace `[YOUR-PASSWORD]`** with your actual password

7. **Create TWO versions:**

   **Pooler (for app):**
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

   **Direct (for migrations):**
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

---

### **C. Run Migrations**

**From your local computer:**

```bash
# Navigate to backend
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

---

### **D. Verify Database**

1. **Go to Supabase Dashboard**

2. **Click "Table Editor"**

3. **You should see 14 tables:**
   - users
   - projects
   - wbs
   - cost_codes
   - cost_entries
   - schedules
   - milestones
   - progress_updates
   - progress_reports
   - documents
   - comments
   - risks
   - change_orders
   - project_members

✅ **Database ready!**

---

## ✅ **STEP 4: Connect Everything**

### **A. Update Vercel Environment Variables**

1. **Go to Vercel Dashboard**

2. **Select your project**

3. **Go to Settings** → **"Environment Variables"**

4. **Update NEXT_PUBLIC_API_URL:**
   - Find `NEXT_PUBLIC_API_URL`
   - Click **"Edit"**
   - Change value to: `https://your-backend.railway.app`
   - Click **"Save"**

5. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

### **B. Update Railway Environment Variables**

1. **Go to Railway Dashboard**

2. **Select your backend service**

3. **Go to Variables**

4. **Update FRONTEND_URL:**
   - Find `FRONTEND_URL`
   - Edit value to: `https://your-project.vercel.app`
   - Save

5. **Railway will auto-redeploy**

---

## ✅ **STEP 5: Test Everything!**

### **A. Test Backend**

Open browser or use curl:

```bash
# Test API health
curl https://your-backend.railway.app/api

# Should return: "EPC Project Control API"
```

**Or visit in browser:**
```
https://your-backend.railway.app/api/docs
```

You should see Swagger API documentation!

---

### **B. Test Frontend**

1. **Open your Vercel URL:**
   ```
   https://your-project.vercel.app
   ```

2. **You should see the login page!**

---

### **C. Test Login**

1. **Go to login page:**
   ```
   https://your-project.vercel.app/login
   ```

2. **Login with:**
   - Email: `admin@epc.com`
   - Password: `admin123`

3. **Should redirect to dashboard!**

4. **Check browser console** (F12) - should be NO errors!

---

### **D. Test Features**

- ✅ Dashboard loads
- ✅ Projects page works
- ✅ Can create new project
- ✅ All navigation works
- ✅ No CORS errors

---

## 🎉 **CONGRATULATIONS!**

Your EPC Project Management System is now LIVE!

- **Frontend:** https://your-project.vercel.app
- **Backend:** https://your-backend.railway.app
- **Database:** Supabase PostgreSQL

**Total Cost:** $5/month (Railway only)

---

## 🐛 **Troubleshooting**

### **Issue 1: CORS Error**

**Error:** `Access-Control-Allow-Origin` in browser console

**Fix:**
1. Check `FRONTEND_URL` in Railway matches your Vercel URL
2. Redeploy backend

---

### **Issue 2: Can't Login**

**Error:** `Invalid credentials` or API not responding

**Fix:**
1. Verify backend is running: `https://your-backend.railway.app/api`
2. Check `NEXT_PUBLIC_API_URL` in Vercel
3. Ensure database was seeded

---

### **Issue 3: Build Failed**

**Error:** Build fails on Vercel

**Fix:**
1. Check build logs in Vercel
2. Verify `frontend` is set as Root Directory
3. Check all dependencies are in package.json

---

## 📞 **Need Help?**

Check deployment logs:
- **Vercel:** Deployments → Click deployment → View logs
- **Railway:** Deployments → Click deployment → View logs

---

**Last Updated:** 2025-12-29
