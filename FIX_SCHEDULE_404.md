# Fix Schedule 404 Error - Step by Step

## Root Cause
Error: `Cannot find module '../vendor-chunks/tailwind-merge.js'`

This is a **Next.js bundling issue** with npm workspaces and certain packages.

## What We Fixed

### 1. ✅ Added transpilePackages to next.config.js
```js
transpilePackages: ['tailwind-merge', 'clsx', 'class-variance-authority']
```

This tells Next.js to properly bundle these packages in the server bundle.

### 2. ✅ Created Test Pages
- `/schedule-test` - Minimal page to verify routing works
- `/schedule-simple` - Simple schedule table without complex components
- `/schedule` - Full feature-rich schedule page (original)

### 3. ✅ Cleared All Caches
- Removed `.next` folder
- Removed `node_modules` (running reinstall)

---

## Steps to Fix

### Step 1: Wait for npm install to complete

If `npm install` is still running in terminal, wait until it finishes.
You'll see: `added XXXX packages in XXs`

### Step 2: Kill any running dev servers

Press **Ctrl + C** in any terminal running `npm run dev`

### Step 3: Start Fresh Dev Server

```bash
cd E:\Project\epc\frontend
npm run dev
```

Wait for:
```
✓ Ready in 3-5s
○ Local: http://localhost:3000
```

### Step 4: Test Pages (In Order)

**Test 1: Simple Test Page**
```
http://localhost:3000/dashboard/projects/eee0e120-d6cf-4afa-96c6-2c1cfbda5249/schedule-test
```
Expected: Green text "✅ If you can see this, routing works!"

---

**Test 2: Simple Schedule (No Complex Components)**
```
http://localhost:3000/dashboard/projects/eee0e120-d6cf-4afa-96c6-2c1cfbda5249/schedule-simple
```
Expected: Simple table with 13 tasks

---

**Test 3: Full Schedule Page**
```
http://localhost:3000/dashboard/projects/eee0e120-d6cf-4afa-96c6-2c1cfbda5249/schedule
```
Expected: Full UI with forms, filters, and fancy table

---

## If Still Getting 404

### Option A: Check Browser Console (F12)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy any RED errors
4. Share with me

### Option B: Check Terminal Output
1. Look at terminal running `npm run dev`
2. Any errors in red?
3. Copy and share

### Option C: Force Complete Rebuild

```bash
# Stop server (Ctrl + C)

cd E:\Project\epc\frontend

# Remove everything
Remove-Item -Recurse -Force .next, node_modules

# Fresh install
npm install

# Rebuild
npm run build

# Start dev
npm run dev
```

---

## Expected Results

### ✅ Success Looks Like:
- All 3 test pages load without 404
- Simple table shows 13 schedule tasks
- Full schedule page shows fancy UI with filters
- No red errors in console
- CRUD operations work (Add/Edit/Delete tasks)

### ❌ Still Error?
Share with me:
1. Which test page fails?
2. Browser console errors (F12)
3. Terminal errors (npm run dev output)

---

## Technical Details

**Problem:** Next.js 14 with App Router + npm workspaces doesn't automatically transpile certain ESM packages like `tailwind-merge`.

**Solution:** Add `transpilePackages` to next.config.js to force server-side bundling.

**Why 3 test pages?**
1. `schedule-test` - Tests routing only (no imports)
2. `schedule-simple` - Tests API + basic components
3. `schedule` - Tests full feature set

This helps isolate WHERE the problem is!
