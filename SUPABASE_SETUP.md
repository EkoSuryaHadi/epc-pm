# 🗄️ Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. **Go to [Supabase.com](https://supabase.com)**
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Fill in details:**
   - Organization: (create new or select existing)
   - Name: `epc-project-management`
   - Database Password: (generate strong password - SAVE THIS!)
   - Region: Choose closest to your users (e.g., Singapore for Asia)
   - Pricing Plan: **Free** (500MB database, 2GB bandwidth)

5. **Click "Create new project"**
6. **Wait 2-3 minutes** for database initialization

---

## Step 2: Get Database Connection String

1. **Go to Project Settings** (gear icon)
2. **Click "Database"** in sidebar
3. **Scroll to "Connection string"**
4. **Select "URI" tab**
5. **Copy the connection string:**
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

6. **Replace `[YOUR-PASSWORD]`** with your actual database password

### Connection String Formats:

**For Prisma (Transaction Mode):**
```bash
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**For Direct Connection:**
```bash
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

---

## Step 3: Update Prisma Schema

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Step 4: Run Migrations from Local

```bash
# Navigate to backend
cd backend

# Create .env file
echo 'DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"' > .env
echo 'DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"' >> .env

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run prisma:seed
```

---

## Step 5: Verify Database

1. **Go to Supabase Dashboard**
2. **Click "Table Editor"**
3. **You should see tables:**
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

---

## Step 6: Test Connection

```bash
# Test database connection
npx prisma studio

# Should open http://localhost:5555
# Browse your data
```

---

## 🔐 Security Settings (Optional)

### Enable Row Level Security (RLS)

For production, enable RLS in Supabase:

1. Go to **Authentication** → **Policies**
2. Enable RLS for sensitive tables
3. Create policies based on user roles

### API Keys

Supabase provides:
- **anon key** - For client-side (safe to expose)
- **service_role key** - For server-side (keep secret!)

You can use these for direct Supabase client access if needed.

---

## 📊 Database Limits (Free Tier)

- **Database Size:** 500 MB
- **Bandwidth:** 2 GB/month
- **Concurrent Connections:** Unlimited
- **Backups:** Daily (7 days retention)

---

## 🔄 Backup Strategy

Supabase automatically backs up your database daily.

**Manual Backup:**
```bash
# Export schema
npx prisma db pull

# Export data
pg_dump -h aws-0-[region].pooler.supabase.com \
  -U postgres.[ref] \
  -d postgres \
  -f backup.sql
```

---

## 🐛 Troubleshooting

### Connection Timeout

**Solution:** Use pooler connection string (port 6543) instead of direct (port 5432)

### Too Many Connections

**Solution:** Add `?pgbouncer=true&connection_limit=1` to connection string

### Migration Fails

**Solution:** Use `DIRECT_URL` for migrations:
```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection string copied
- [ ] Prisma schema updated with directUrl
- [ ] Migrations ran successfully
- [ ] Database seeded with initial data
- [ ] Tables visible in Supabase dashboard
- [ ] Connection tested with Prisma Studio

---

**Next:** Deploy backend to Cloudflare Workers or Railway

**Last Updated:** 2025-12-29
