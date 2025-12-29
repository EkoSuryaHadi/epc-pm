# 🏗️ EPC Project Control Application

> Comprehensive Project Control system for EPC Oil & Gas industry with advanced cost tracking, schedule management, progress monitoring, Earned Value Management (EVM), and document control.

![Status](https://img.shields.io/badge/Phase%201-Completed-success)
![Backend](https://img.shields.io/badge/Backend-NestJS%2010-red)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)

## ✨ Features

### Phase 1 - Foundation (✅ Completed)
- 🔐 **Authentication & Authorization** - JWT-based with 9 user roles
- 👥 **User Management** - Complete CRUD with role-based permissions
- 📁 **Multi-Project Support** - Manage multiple EPC projects
- 📊 **Work Breakdown Structure** - Hierarchical WBS with weightage
- 💰 **Cost Control** - Budget tracking, cost codes, variance analysis
- 📅 **Schedule Management** - Tasks, dependencies, milestones, critical path
- 📈 **Progress Tracking** - Weighted progress, S-curves, EVM metrics
- 📄 **Document Control** - Version control, approval workflow, comments
- ⚠️ **Risk Management** - Risk register with scoring and mitigation
- 🔄 **Change Orders** - Complete change order workflow
- 📊 **Dashboard APIs** - Aggregated project data

### Coming in Phase 2-8
- Interactive Gantt charts with drag-drop
- Real-time EVM calculations (CPI, SPI, CV, SV)
- S-Curve visualizations (Planned vs Actual)
- Advanced reporting & PDF/Excel export
- File upload with document management
- Email notifications
- P6/MS Project integration
- And much more...

## 🏗️ Tech Stack

### Backend
- **NestJS 10.x** - Progressive Node.js framework
- **Prisma ORM 5.x** - Type-safe database access
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching layer
- **Passport.js** - Authentication strategies
- **Swagger/OpenAPI** - API documentation
- **JWT** - Secure token-based auth

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **TanStack Query** - Data fetching & caching
- **NextAuth.js** - Authentication for Next.js
- **Recharts** - Chart visualization
- **Axios** - HTTP client

### DevOps
- **Docker & Docker Compose** - Containerization
- **npm Workspaces** - Monorepo management
- **ESLint** - Code linting
- **Prisma Studio** - Database GUI

## 📁 Project Structure

```
epc/
├── backend/                    # NestJS Backend (50+ files)
│   ├── prisma/
│   │   ├── schema.prisma      # 14 models, 20+ relations
│   │   └── seed.ts            # Initial data
│   ├── src/
│   │   ├── auth/              # JWT + Passport authentication
│   │   ├── users/             # User management
│   │   ├── projects/          # Project CRUD + members
│   │   ├── wbs/               # Work Breakdown Structure
│   │   ├── cost/              # Cost control (codes + entries)
│   │   ├── schedule/          # Schedule tasks + milestones
│   │   ├── progress/          # Progress tracking + EVM
│   │   ├── documents/         # Document management
│   │   ├── risks/             # Risk register + change orders
│   │   ├── dashboard/         # Aggregated dashboard data
│   │   ├── prisma/            # Database service
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   └── Dockerfile
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/         # Login page
│   │   │   ├── dashboard/     # Protected dashboard
│   │   │   │   ├── projects/  # Projects page
│   │   │   │   └── layout.tsx # Dashboard layout
│   │   │   ├── api/auth/      # NextAuth API routes
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── providers.tsx  # Global providers
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── layout/        # Sidebar + Navigation
│   │   ├── lib/
│   │   │   ├── api.ts         # Complete API client (40+ methods)
│   │   │   └── utils.ts       # Helper utilities
│   │   └── types/             # TypeScript definitions
│   └── Dockerfile
│
├── docker-compose.yml          # PostgreSQL + Redis + Services
├── package.json                # Root workspace
├── README.md                   # This file
├── SETUP.md                    # Detailed setup guide
├── DEVELOPMENT.md              # Development workflow
├── PROJECT_STATUS.md           # Current status & roadmap
└── QUICKSTART.md              # 5-minute quick start
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose

### 5-Minute Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment files
cd backend
echo DATABASE_URL=postgresql://epc_user:epc_password@localhost:5432/epc_db > .env
echo JWT_SECRET=your-secret-key-change-in-production >> .env
echo PORT=3001 >> .env

cd ../frontend
echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo NEXTAUTH_SECRET=your-secret >> .env.local
cd ..

# 3. Start Docker services (PostgreSQL + Redis)
npm run docker:dev

# 4. Setup database
npm run prisma:generate
npm run prisma:migrate
cd backend && npm run prisma:seed && cd ..

# 5. Start development servers
npm run dev
```

### Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | admin@epc.com / admin123 |
| **Backend API** | http://localhost:3001/api | - |
| **API Docs** | http://localhost:3001/api/docs | - |
| **Prisma Studio** | Run `npm run prisma:studio` | - |

### Default User Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@epc.com | admin123 | Admin |
| pm@epc.com | admin123 | Project Manager |
| engineer@epc.com | admin123 | Project Control Engineer |

## 📊 Database Schema

The application uses a comprehensive database schema with 14 models:

- **users** - User accounts with 9 role types
- **projects** - EPC project management
- **project_members** - Project team associations
- **wbs** - Hierarchical Work Breakdown Structure
- **cost_codes** - Cost code definitions
- **cost_entries** - Actual cost tracking
- **schedules** - Schedule tasks with dependencies
- **milestones** - Project milestones
- **progress_updates** - Progress tracking by WBS
- **progress_reports** - EVM reports (PV, EV, AC, CPI, SPI)
- **documents** - Document register with versioning
- **comments** - Document comments
- **risks** - Risk register with scoring
- **change_orders** - Change order management

## 🌟 Key Capabilities

### Multi-Project Management
- Create and manage multiple EPC projects
- Project lifecycle tracking (Planning → Active → Completed)
- Multi-currency support
- Client and contractor information

### Cost Control
- Hierarchical cost code structure
- Budget vs actual tracking
- Cost variance analysis
- Cost summary by project
- Support for CAPEX/OPEX tracking

### Schedule Management
- Task creation with dependencies
- Critical path identification
- Milestone tracking
- Planned vs actual hours
- Resource allocation

### Progress Tracking
- Weighted progress by WBS
- Physical vs planned progress comparison
- S-curve data ready
- Manhours tracking
- Performance indicators

### Earned Value Management (EVM)
- Planned Value (PV)
- Earned Value (EV)
- Actual Cost (AC)
- Cost Performance Index (CPI)
- Schedule Performance Index (SPI)

### Document Control
- Document upload and versioning
- Status workflow (Draft → Review → Approved)
- Category and discipline organization
- Comment and collaboration system
- Revision tracking

### Risk Management
- Risk register with probability × impact scoring
- Risk matrix (Critical/High/Medium/Low)
- Mitigation tracking
- Risk status management
- Change order workflow

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Build
npm run build           # Build both applications
npm run build:backend   # Build backend only
npm run build:frontend  # Build frontend only

# Docker
npm run docker:dev      # Start all services
npm run docker:down     # Stop all services

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
```

## 🔐 User Roles

- **Project Manager**: Full access
- **Project Control Engineer**: Cost & schedule management
- **Planning Engineer**: Schedule updates
- **Cost Engineer**: Cost tracking & forecasting
- **Document Controller**: Document management
- **Discipline Engineer**: Progress updates
- **Client**: Read-only dashboard access
- **Executive**: High-level dashboards

## 📊 Core Modules

1. **Project Management**: Multi-project setup with WBS
2. **Cost Control**: Budget tracking, EVM, variance analysis
3. **Schedule Management**: Gantt charts, critical path, milestones
4. **Progress Tracking**: S-curves, physical progress, manhours
5. **Document Control**: Version control, approval workflows
6. **Reporting**: Automated reports, dashboards, KPIs

## 🛠️ Development

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://epc_user:epc_password@localhost:5432/epc_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PORT=3001
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## 📝 License

Proprietary - All rights reserved
