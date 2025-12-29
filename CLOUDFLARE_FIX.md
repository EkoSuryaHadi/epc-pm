# ☁️ Cloudflare Pages Build Configuration

## 🎯 **Correct Build Settings for Next.js**

Gunakan konfigurasi ini di Cloudflare Pages Dashboard:

---

## 📋 **Build Configuration**

### **Framework Preset**
```
Next.js (Static HTML Export)
```

### **Build Command**
```bash
cd frontend && npm install && npm run build
```

### **Build Output Directory**
```
frontend/.next
```

### **Root Directory**
```
(leave empty or /)
```

### **Node Version**
```
18
```

---

## 🔧 **Environment Variables**

Add these in Cloudflare Pages → Settings → Environment variables:

### **Production Variables:**

```bash
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# NextAuth Configuration
NEXTAUTH_URL=https://your-project.pages.dev
NEXTAUTH_SECRET=your-32-character-secret-here

# Node Version
NODE_VERSION=18
```

### **How to Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 **Alternative: Use @cloudflare/next-on-pages**

For full Next.js features (SSR, API Routes) on Cloudflare Pages:

### **1. Install Adapter**

```bash
cd frontend
npm install --save-dev @cloudflare/next-on-pages
```

### **2. Update package.json**

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev .vercel/output/static",
    "deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static --project-name=epc-project-management"
  }
}
```

### **3. Update Cloudflare Build Settings**

```bash
# Build Command
cd frontend && npm install && npm run pages:build

# Build Output Directory
frontend/.vercel/output/static

# Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://epc-project-management.pages.dev
NEXTAUTH_SECRET=your-secret
NODE_VERSION=18
```

---

## 🎯 **Recommended Approach: Use Vercel Instead**

**Cloudflare Pages has limitations with Next.js SSR and API routes.**

### **Better Options:**

#### **Option 1: Vercel (Recommended for Next.js)**
- ✅ Full Next.js support (SSR, API routes, middleware)
- ✅ Zero configuration
- ✅ Free tier (100GB bandwidth)
- ✅ Auto-deploy from GitHub
- ✅ Built by Next.js creators

**Deploy to Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Select `frontend` as root directory
4. Add environment variables
5. Deploy!

#### **Option 2: Cloudflare Pages (Static Export)**
- ✅ Free unlimited bandwidth
- ✅ Global CDN
- ❌ No SSR/API routes (static only)
- ❌ Requires configuration

**Use if:** You only need static site

#### **Option 3: Keep Cloudflare + Railway**
- ✅ Cloudflare for frontend (static)
- ✅ Railway for backend (API)
- ✅ Supabase for database
- ✅ All features work

**Use if:** You want Cloudflare's CDN + free tier

---

## 🔧 **Fix Current Cloudflare Build Error**

The error shows Cloudflare is looking for Wrangler config. Here's the fix:

### **Option A: Use Static Export**

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export
  images: {
    unoptimized: true,
  },
  // ... rest of config
};

module.exports = nextConfig;
```

**Cloudflare Build Settings:**
```bash
Build command: cd frontend && npm install && npm run build
Build output: frontend/out
```

**Limitations:**
- ❌ No API routes
- ❌ No SSR
- ❌ No middleware
- ✅ Static pages only

### **Option B: Switch to Vercel**

**Vercel Build Settings:**
```bash
Framework: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret
```

---

## 📊 **Comparison**

| Feature | Cloudflare Pages | Vercel |
|---------|-----------------|--------|
| **Next.js SSR** | ⚠️ Limited | ✅ Full |
| **API Routes** | ⚠️ Limited | ✅ Full |
| **Bandwidth** | ✅ Unlimited | ✅ 100GB free |
| **Build Time** | ⚠️ Slower | ✅ Fast |
| **Configuration** | ⚠️ Complex | ✅ Zero-config |
| **Price** | ✅ Free | ✅ Free (hobby) |
| **Best For** | Static sites | Next.js apps |

---

## 🎯 **My Recommendation**

### **For Your EPC Project:**

**Use Vercel for Frontend + Railway for Backend**

**Why?**
1. ✅ Your app uses NextAuth (needs API routes)
2. ✅ You have dynamic pages
3. ✅ Vercel is made for Next.js
4. ✅ Zero configuration needed
5. ✅ Still free!

**Stack:**
- **Frontend:** Vercel (Next.js with SSR)
- **Backend:** Railway (NestJS API)
- **Database:** Supabase (PostgreSQL)

**Total Cost:** $5/month (Railway only)

---

## 🚀 **Quick Fix: Switch to Vercel**

1. **Go to [vercel.com](https://vercel.com)**
2. **Import GitHub repo:** `EkoSuryaHadi/epc-pm`
3. **Configure:**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=your-secret
   ```

5. **Deploy!** (2-3 minutes)

6. **Done!** ✅

---

## 📞 **Need Help?**

Let me know if you want to:
1. ✅ **Switch to Vercel** (recommended)
2. ⚠️ **Fix Cloudflare** (static export only)
3. 🔧 **Use @cloudflare/next-on-pages** (complex setup)

**I recommend Option 1: Switch to Vercel** - It's the easiest and most reliable!

---

**Last Updated:** 2025-12-29
