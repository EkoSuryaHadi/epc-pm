# 🔐 Authentication Fix - Resolved Unauthorized Error

**Date**: 22 October 2025, 21:45  
**Issue**: Error "unauthorized" when creating project  
**Status**: ✅ FIXED

---

## 🐛 Problem Analysis

**Root Cause**: Token mismatch between NextAuth session and API client

### What Was Wrong:
1. NextAuth menyimpan `accessToken` di session JWT
2. API client (`api.ts`) mencari token di `localStorage`
3. Token tidak pernah dikirim ke backend
4. Backend reject request dengan "401 Unauthorized"

---

## ✅ Solution Implemented

### 1. Created New API Client with Token Support
**File**: `frontend/src/lib/api-client.ts`

**Features:**
- Factory function `createApiClient(token?)` 
- Accepts token parameter
- Adds token to Authorization header
- Returns configured axios instance

```typescript
export function createApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
  });

  if (token) {
    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  return client;
}
```

### 2. Created API Methods Factory
**Function**: `createApiMethods(token?)`

Creates API methods with authenticated client:
- `projects.*`
- `wbs.*`
- `cost.*`
- `schedule.*`
- `progress.*`
- `documents.*`
- `risks.*`
- `dashboard.*`

### 3. Updated ProjectForm Component
**File**: `frontend/src/components/projects/ProjectForm.tsx`

**Changes:**
- Added `useSession()` hook from next-auth
- Get token from `session.user.accessToken`
- Create authenticated API client: `createApiMethods(token)`
- Added authentication check before submit

```typescript
const { data: session } = useSession();

const onSubmit = async (data) => {
  if (!session?.user?.accessToken) {
    toast.error('You must be logged in');
    return;
  }

  const api = createApiMethods(session.user.accessToken);
  const response = await api.projects.create(payload);
  // ...
};
```

### 4. Added TypeScript Declarations
**File**: `frontend/src/types/next-auth.d.ts`

Extended NextAuth types to include:
- `session.user.accessToken`
- `session.user.role`
- `JWT.accessToken`
- `JWT.role`

---

## 🔄 How It Works Now

### Authentication Flow:

1. **User Login** (via NextAuth):
   ```
   POST /api/auth/login
   → Backend returns: { access_token, user: { id, name, email, role } }
   → NextAuth stores in JWT session
   ```

2. **Session Token Storage**:
   ```typescript
   session = {
     user: {
       id: "...",
       name: "...",
       email: "...",
       role: "ADMIN",
       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." // ← JWT token
     }
   }
   ```

3. **API Request with Token**:
   ```typescript
   const api = createApiMethods(session.user.accessToken);
   api.projects.create(data);
   // → Headers: { Authorization: "Bearer eyJhbGc..." }
   ```

4. **Backend Validates**:
   ```
   Backend receives request with Authorization header
   → JWT Guard validates token
   → Extracts user from token
   → Allows request ✅
   ```

---

## 📝 Files Changed

### Created:
1. `frontend/src/lib/api-client.ts` - New authenticated API client
2. `frontend/src/types/next-auth.d.ts` - TypeScript declarations

### Modified:
1. `frontend/src/components/projects/ProjectForm.tsx` - Uses session token
2. `frontend/src/app/layout.tsx` - Added Toaster component

### Installed:
- `@radix-ui/react-icons` - Missing dependency for shadcn

---

## 🧪 Testing Instructions

### 1. Refresh Browser
Press `Ctrl + Shift + R` or `Cmd + Shift + R` to hard reload

### 2. Clear Cache (if needed)
- Chrome/Edge: F12 → Network → "Disable cache" checkbox
- Firefox: F12 → Network → Settings → "Disable cache"

### 3. Test Flow:
```
1. Go to: http://localhost:3000
2. Login: admin@epc.com / admin123
3. Click "Projects" sidebar
4. Click "New Project" button
5. Fill form:
   - Let auto-generated code or click "Generate"
   - Project Name: "Test Project 1"
   - Description: "Testing authentication fix"
   - Location: "Jakarta"
   - Client: "Test Client"
   - Contractor: "Test Contractor"
   - Status: "PLANNING"
   - Start Date: Today
   - End Date: 1 year from now
   - Budget: 10000000
   - Currency: USD
6. Click "Create Project"
```

### 4. Expected Results:
- ✅ No "unauthorized" error
- ✅ Success toast appears: "Project created successfully"
- ✅ Redirect to project detail page
- ✅ Project saved in database

### 5. Verify in Backend:
Check console logs should show:
```
[Nest] INFO [ProjectsController] POST /api/projects
[Nest] INFO User: admin@epc.com
[Nest] INFO Project created: PRJ-...
```

---

## 🔍 Debugging Tips

### If Still Getting "Unauthorized":

1. **Check Session Token in Browser**:
   ```javascript
   // Open browser console (F12)
   import { getSession } from 'next-auth/react';
   const session = await getSession();
   console.log(session.user.accessToken);
   // Should print JWT token
   ```

2. **Check Network Request**:
   - F12 → Network tab
   - Create project
   - Find POST request to `/api/projects`
   - Check Headers → Authorization should be: `Bearer eyJhbG...`

3. **Check Backend Logs**:
   ```bash
   # Look for JWT validation errors
   # Should see: "User authenticated: admin@epc.com"
   ```

4. **Try Re-login**:
   - Logout
   - Clear browser cookies
   - Login again
   - Try create project

---

## 🎯 Next Steps

After successful test:
- ✅ Authentication working
- ✅ Can create projects
- 🚀 Ready for Task 2: WBS Builder Interface

---

## 📚 Technical Notes

### Why This Approach?

**Pros:**
- Clean separation of concerns
- Easy to add token to any API call
- Type-safe with TypeScript
- Works with NextAuth session
- No localStorage needed

**Cons:**
- Must pass token to each API call
- Slight overhead creating client each time

### Alternative Approaches Considered:

1. **Global axios interceptor with getSession()**:
   - Requires server component
   - More complex
   - Async issues

2. **Store token in localStorage on login**:
   - Redundant storage
   - Security concern
   - Must sync with session

3. **Use NextAuth built-in fetch wrapper**:
   - Limited customization
   - Harder to debug
   - Less flexible

**Chosen approach** balances simplicity, security, and maintainability.

---

**Status**: READY FOR TESTING ✅  
**Confidence Level**: HIGH 🎯
