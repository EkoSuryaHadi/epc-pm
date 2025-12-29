# Development Guide

## 📋 Phase 1 Status: ✅ COMPLETED

### Completed Features

✅ **Infrastructure**
- Monorepo setup with npm workspaces
- Docker Compose with PostgreSQL & Redis
- Environment configuration

✅ **Backend (NestJS)**
- Complete API structure with Swagger documentation
- Prisma ORM with comprehensive database schema
- Authentication & JWT strategy
- RBAC (Role-Based Access Control)
- All core modules:
  - Users Management
  - Projects Management
  - WBS (Work Breakdown Structure)
  - Cost Control (Cost Codes & Entries)
  - Schedule Management
  - Progress Tracking
  - Document Management
  - Risk & Change Orders
  - Dashboard APIs

✅ **Frontend (Next.js 14)**
- App Router structure
- NextAuth.js integration
- TanStack Query setup
- shadcn/ui components
- Responsive layout with sidebar
- Login page
- Dashboard page
- Projects page
- API client with Axios

## 🚧 Next Phases

### Phase 2: Core Modules - Cost & Project Setup (Week 3-4)

**Tasks:**
1. Create Project Form with validation
2. WBS Builder Interface (drag-drop tree)
3. Cost Code Management UI
4. Budget Entry Forms
5. Cost vs Actual Charts (Recharts)
6. Cost Dashboard with KPIs

### Phase 3: Schedule Management (Week 5-6)

**Tasks:**
1. Gantt Chart Component
2. Task Creation & Editing
3. Dependency Management
4. Critical Path Visualization
5. Resource Allocation UI
6. Milestone Tracking

### Phase 4: Progress Tracking & EVM (Week 7-8)

**Tasks:**
1. Progress Update Forms
2. S-Curve Charts (Planned vs Actual)
3. EVM Calculations (CPI, SPI, CV, SV)
4. Weighted Progress Dashboard
5. Manhours Tracking
6. Performance Trends

### Phase 5: Document Management (Week 9-10)

**Tasks:**
1. File Upload Component
2. Document Register Table
3. Approval Workflow UI
4. Version Control Interface
5. Document Search & Filters
6. Comment System

### Phase 6: Dashboards & Reporting (Week 11-12)

**Tasks:**
1. Executive Dashboard
2. Cost Performance Charts
3. Schedule Performance Indicators
4. Risk Heat Map
5. Report Builder
6. PDF/Excel Export
7. Email Notifications

### Phase 7: Advanced Features (Week 13-14)

**Tasks:**
1. Procurement Module
2. Risk Matrix UI
3. Change Order Workflow
4. Cash Flow Forecasting
5. Look-Ahead Planning
6. P6/MS Project Import API

### Phase 8: Testing & Deployment (Week 15-16)

**Tasks:**
1. Unit Tests (Backend)
2. E2E Tests (Frontend)
3. Security Audit
4. Performance Optimization
5. Production Deployment
6. CI/CD Pipeline
7. Documentation
8. User Training

## 💻 Development Workflow

### Adding a New Feature

1. **Backend:**
   ```bash
   cd backend
   
   # Create module
   nest g module feature-name
   nest g service feature-name
   nest g controller feature-name
   
   # Update Prisma schema if needed
   # Add to prisma/schema.prisma
   npx prisma migrate dev --name feature-name
   npx prisma generate
   ```

2. **Frontend:**
   ```bash
   cd frontend
   
   # Create page
   mkdir -p src/app/dashboard/feature-name
   touch src/app/dashboard/feature-name/page.tsx
   
   # Create components
   mkdir -p src/components/feature-name
   touch src/components/feature-name/ComponentName.tsx
   ```

3. **API Integration:**
   - Add API methods in `frontend/src/lib/api.ts`
   - Use TanStack Query for data fetching
   - Add types in `frontend/src/types/`

### Testing

**Backend:**
```bash
cd backend
npm run test           # Unit tests
npm run test:watch     # Watch mode
npm run test:cov       # Coverage
```

**Frontend:**
```bash
cd frontend
npm run lint           # ESLint
npm run build          # Build test
```

### Database Migrations

```bash
cd backend

# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Code Style

- **TypeScript** strict mode enabled
- **ESLint** for linting
- **Prettier** for formatting (recommended)
- Follow existing patterns in codebase

## 🎨 UI/UX Guidelines

### Design System
- Use shadcn/ui components as base
- Tailwind CSS for styling
- Consistent spacing (4px grid)
- Color palette from globals.css

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test on multiple screen sizes

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast compliance

## 📊 Database Best Practices

### Prisma Guidelines
- Always use transactions for related operations
- Use `select` to limit returned fields
- Include relations only when needed
- Add indexes for frequently queried fields

### Performance
- Implement pagination for large datasets
- Use database-level constraints
- Cache frequently accessed data (Redis)
- Optimize N+1 queries

## 🔐 Security Checklist

- [ ] Validate all inputs (class-validator)
- [ ] Sanitize user content
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Implement rate limiting (already configured)
- [ ] Hash passwords (bcrypt)
- [ ] Secure JWT tokens
- [ ] HTTPS in production
- [ ] CORS configuration
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection

## 📝 API Documentation

API docs available at: http://localhost:3001/api/docs

Update Swagger decorators when adding endpoints:
```typescript
@ApiTags('feature')
@ApiOperation({ summary: 'Description' })
@ApiBearerAuth()
```

## 🚀 Deployment

### Production Build

```bash
# Build both applications
npm run build

# Or separately
npm run build:backend
npm run build:frontend
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Ensure these are set in production:
- Strong JWT_SECRET
- Strong NEXTAUTH_SECRET
- Production DATABASE_URL
- Production REDIS_URL
- Correct FRONTEND_URL and API URLs

## 📈 Monitoring

Consider adding:
- Application logs (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Database monitoring (Prisma Cloud)
- Uptime monitoring

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow code style guidelines
3. Write tests for new features
4. Update documentation
5. Submit pull request

## 📚 Learning Resources

- **NestJS Best Practices**: https://docs.nestjs.com/techniques/security
- **Next.js Patterns**: https://nextjs.org/docs/app/building-your-application
- **Prisma Performance**: https://www.prisma.io/docs/guides/performance-and-optimization
- **React Query**: https://tanstack.com/query/latest/docs/react/overview
