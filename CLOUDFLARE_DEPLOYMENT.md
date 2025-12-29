# ☁️ Cloudflare Pages Deployment Guide

Complete guide to deploy EPC Project Management System to Cloudflare Pages.

---

## 🎯 **Architecture Overview**

- **Frontend:** Cloudflare Pages (Next.js Static Export)
- **Backend:** Railway/Render (NestJS API)
- **Database:** Supabase PostgreSQL

> **Note:** Cloudflare Pages works best with static Next.js exports. For full Next.js features (SSR, API routes), we'll deploy backend separately to Railway/Render.

---

## 📋 **Prerequisites**

- [x] Cloudflare account
- [x] GitHub repository pushed
- [x] Supabase database setup (see SUPABASE_SETUP.md)
- [x] Backend deployed to Railway/Render

---

## 🚀 **Step 1: Prepare Frontend for Static Export**

### A. Update Next.js Config

Create/update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true,  // Required for static export
  },
  // Remove trailing slashes
  trailingSlash: true,
  // Disable server-side features
  experimental: {
    // Disable features not compatible with static export
  },
}

module.exports = nextConfig
```

### B. Update Package.json

Update `frontend/package.json` build script:

```json
{
  "scripts": {
    "build": "next build",
    "export": "next build && next export"
  }
}
```

---

## ☁️ **Step 2: Deploy to Cloudflare Pages**

### Option 1: Via Cloudflare Dashboard (Recommended)

1. **Login to [Cloudflare Dashboard](https://dash.cloudflare.com)**

2. **Go to Pages:**
   - Click "Workers & Pages" in sidebar
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub:**
   - Authorize Cloudflare to access GitHub
   - Select repository: `EkoSuryaHadi/epc-pm`

4. **Configure Build Settings:**
   ```
   Project name: epc-project-management
   Production branch: main
   Framework preset: Next.js
   Build command: cd frontend && npm install && npm run build
   Build output directory: frontend/out
   Root directory: /
   ```

5. **Environment Variables:**
   Click "Add variable" for each:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXTAUTH_URL=https://epc-project-management.pages.dev
   NEXTAUTH_SECRET=your-32-char-secret-here
   NODE_VERSION=18
   ```

6. **Click "Save and Deploy"**

7. **Wait for Build** (2-5 minutes)

8. **Get Your URL:**
   - Primary: `https://epc-project-management.pages.dev`
   - Custom domain: (optional, configure later)

### Option 2: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to frontend
cd frontend

# Build for production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=epc-project-management
```

---

## 🔧 **Step 3: Deploy Backend to Railway**

Since Cloudflare Pages is static-only, deploy backend separately:

### A. Create Railway Project

1. **Go to [Railway.app](https://railway.app)**
2. **New Project** → "Deploy from GitHub"
3. **Select:** `EkoSuryaHadi/epc-pm`

### B. Configure Backend Service

```
Service name: epc-backend
Root directory: backend
Build command: npm install && npm run build
Start command: npx prisma migrate deploy && npm run start:prod
```

### C. Environment Variables

```bash
# From Supabase
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Server
PORT=3001
NODE_ENV=production

# CORS - Your Cloudflare Pages URL
FRONTEND_URL=https://epc-project-management.pages.dev
```

### D. Get Backend URL

After deployment, Railway gives you:
```
https://epc-backend-production-xxxx.up.railway.app
```

---

## 🔗 **Step 4: Connect Frontend to Backend**

### Update Cloudflare Pages Environment Variables

1. **Go to Cloudflare Pages Dashboard**
2. **Select your project**
3. **Settings** → **Environment variables**
4. **Update:**
   ```
   NEXT_PUBLIC_API_URL=https://epc-backend-production-xxxx.up.railway.app
   ```
5. **Redeploy** (automatic or manual trigger)

---

## 🌐 **Step 5: Custom Domain (Optional)**

### Add Custom Domain to Cloudflare Pages

1. **Go to your Pages project**
2. **Custom domains** tab
3. **Set up a custom domain**
4. **Add domain:** `epc.yourdomain.com`
5. **Cloudflare will auto-configure DNS**

### Update Environment Variables

After adding custom domain:

```bash
# Cloudflare Pages
NEXTAUTH_URL=https://epc.yourdomain.com

# Railway Backend
FRONTEND_URL=https://epc.yourdomain.com
```

---

## ✅ **Step 6: Verify Deployment**

### Test Checklist

- [ ] Frontend loads: `https://epc-project-management.pages.dev`
- [ ] Login page accessible: `/login`
- [ ] Backend API responds: `https://your-backend.railway.app/api`
- [ ] API docs work: `https://your-backend.railway.app/api/docs`
- [ ] Login works with credentials:
  - Email: `admin@epc.com`
  - Password: `admin123`
- [ ] Dashboard loads after login
- [ ] Projects page works
- [ ] No CORS errors in browser console

### Test Commands

```bash
# Test backend health
curl https://your-backend.railway.app/api

# Test login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@epc.com","password":"admin123"}'
```

---

## 🐛 **Troubleshooting**

### Build Fails: "next export not found"

**Solution:** Next.js 13+ uses `output: 'export'` in config instead of `next export` command.

Update `next.config.js`:
```javascript
module.exports = {
  output: 'export',
}
```

### CORS Error

**Solution:** Update backend CORS in `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://epc-project-management.pages.dev',
    'https://epc.yourdomain.com',
    'http://localhost:3000', // for local dev
  ],
  credentials: true,
});
```

### Images Not Loading

**Solution:** Add `unoptimized: true` to next.config.js:

```javascript
module.exports = {
  images: {
    unoptimized: true,
  },
}
```

### API Calls Fail

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running
3. Check browser console for errors
4. Test backend URL directly

### Environment Variables Not Working

**Solution:** 
- Cloudflare Pages only exposes vars starting with `NEXT_PUBLIC_`
- Redeploy after changing environment variables
- Clear browser cache

---

## 📊 **Performance Optimization**

### Cloudflare Pages Benefits

- ✅ **Global CDN** - 275+ locations worldwide
- ✅ **Automatic HTTPS** - Free SSL certificates
- ✅ **Unlimited bandwidth** - No bandwidth limits
- ✅ **DDoS protection** - Built-in security
- ✅ **Fast builds** - Parallel builds
- ✅ **Preview deployments** - Every PR gets preview URL

### Caching Strategy

Cloudflare automatically caches static assets. Configure in `frontend/next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

---

## 💰 **Pricing**

### Cloudflare Pages (Free Tier)

- ✅ **Unlimited sites**
- ✅ **Unlimited requests**
- ✅ **Unlimited bandwidth**
- ✅ **500 builds/month**
- ✅ **1 build at a time**

### Railway (Hobby Plan)

- 💵 **$5/month**
- ✅ **512MB RAM**
- ✅ **1GB disk**
- ✅ **100GB bandwidth**

### Supabase (Free Tier)

- ✅ **500MB database**
- ✅ **2GB bandwidth/month**
- ✅ **Unlimited API requests**

**Total Cost: ~$5/month** 🎉

---

## 🔄 **CI/CD Workflow**

Cloudflare Pages automatically:

1. **Watches GitHub repo**
2. **Builds on every push to main**
3. **Creates preview for PRs**
4. **Deploys to production**

### Manual Redeploy

```bash
# Via Wrangler CLI
cd frontend
npm run build
wrangler pages deploy out --project-name=epc-project-management
```

---

## 📞 **Next Steps**

1. ✅ Setup Supabase database
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Cloudflare Pages
4. ✅ Connect frontend to backend
5. ⬜ Add custom domain (optional)
6. ⬜ Setup monitoring (Sentry)
7. ⬜ Configure backups
8. ⬜ Add analytics

---

**Last Updated:** 2025-12-29
