# EPC Project Control - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose
- Git

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 2: Environment Setup

Create environment files:

**Backend** - Create `backend/.env`:
```env
DATABASE_URL=postgresql://epc_user:epc_password@localhost:5432/epc_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
```

### Step 3: Start Database Services

```bash
# Start PostgreSQL and Redis with Docker
npm run docker:dev
```

Wait until services are healthy (about 10-30 seconds).

### Step 4: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (creates admin users)
cd backend
npm run prisma:seed
cd ..
```

### Step 5: Start Development Servers

**Option A: Start both servers together**
```bash
npm run dev
```

**Option B: Start separately**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs
- **Prisma Studio**: `npm run prisma:studio` (database viewer)

## 👤 Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@epc.com | admin123 | Admin |
| pm@epc.com | admin123 | Project Manager |
| engineer@epc.com | admin123 | Project Control Engineer |

## 📁 Project Structure

```
epc/
├── backend/                    # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Initial data seeder
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # Users management
│   │   ├── projects/          # Projects module
│   │   ├── wbs/               # Work Breakdown Structure
│   │   ├── cost/              # Cost control
│   │   ├── schedule/          # Schedule management
│   │   ├── progress/          # Progress tracking
│   │   ├── documents/         # Document management
│   │   ├── risks/             # Risk & change orders
│   │   ├── dashboard/         # Dashboard data
│   │   └── main.ts            # Entry point
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── login/         # Login page
│   │   │   ├── dashboard/     # Dashboard pages
│   │   │   └── api/           # API routes (NextAuth)
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/            # UI components
│   │   │   └── layout/        # Layout components
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # API client
│   │   │   └── utils.ts       # Helper functions
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── docker-compose.yml          # Docker services
├── package.json                # Root package.json
└── README.md
```

## 🔧 Common Commands

### Development
```bash
npm run dev                 # Start both servers
npm run dev:backend         # Backend only
npm run dev:frontend        # Frontend only
```

### Database
```bash
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run migrations
npm run prisma:studio       # Open database viewer
cd backend && npm run prisma:seed  # Seed database
```

### Docker
```bash
npm run docker:dev          # Start services
npm run docker:down         # Stop services
docker-compose logs -f      # View logs
```

### Build
```bash
npm run build               # Build both applications
npm run build:backend       # Build backend only
npm run build:frontend      # Build frontend only
```

## 🐛 Troubleshooting

### Port Already in Use
If you see "port already in use" error:
```bash
# Check what's using the port
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process or change port in .env files
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
npm run docker:down
npm run docker:dev
```

### Prisma Client Not Generated
```bash
cd backend
npx prisma generate
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
npm install
```

## 📊 Database Schema

The application includes these main tables:
- **users** - User accounts with roles
- **projects** - EPC projects
- **project_members** - Project team members
- **wbs** - Work Breakdown Structure (hierarchical)
- **cost_codes** - Cost code definitions
- **cost_entries** - Actual cost entries
- **schedules** - Schedule tasks
- **milestones** - Project milestones
- **progress_updates** - Progress tracking by WBS
- **progress_reports** - EVM reports
- **documents** - Document register
- **comments** - Document comments
- **risks** - Risk register
- **change_orders** - Change order management

## 🎯 Next Steps

After successful setup:

1. **Login** to the application using default credentials
2. **Create a Project** from the Projects page
3. **Setup WBS** for your project structure
4. **Define Cost Codes** for budget tracking
5. **Add Schedule** tasks and milestones
6. **Track Progress** with regular updates
7. **Explore Dashboard** for project insights

## 📚 Additional Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **shadcn/ui Components**: https://ui.shadcn.com

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Check API documentation: http://localhost:3001/api/docs
4. Verify environment variables are set correctly

## 🔐 Security Notes

⚠️ **IMPORTANT for Production:**
1. Change all default passwords
2. Use strong JWT secrets
3. Enable HTTPS
4. Setup proper CORS policies
5. Use environment-specific configs
6. Enable rate limiting
7. Setup proper backup strategies
8. Review and update security headers
