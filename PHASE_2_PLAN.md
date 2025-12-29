# 🚀 Phase 2: Core Modules - Cost & Project Setup

**Timeline**: Week 3-4 (Started: 22 Oct 2025)  
**Status**: 🟢 IN PROGRESS  
**Focus**: Complete project setup and cost control UI

---

## 🎯 Objectives

Build the core user interfaces for:
1. Creating and managing projects
2. Building hierarchical Work Breakdown Structure (WBS)
3. Managing cost codes and budgets
4. Tracking costs against budget
5. Visualizing cost performance

---

## 📋 Tasks Breakdown

### Task 1: Project Creation Form ⏳
**Priority**: HIGH  
**Estimated Time**: 4-6 hours

**Requirements:**
- Form with validation using React Hook Form + Zod
- Fields:
  - Project Code (unique, auto-generate option)
  - Project Name
  - Description
  - Location
  - Client Name
  - Contractor Name
  - Start Date & End Date (date pickers)
  - Total Budget (currency input)
  - Currency selector (USD, EUR, IDR, etc.)
  - Status (dropdown)
- Real-time validation
- Success/error notifications
- Auto-assign current user as Project Manager

**Files to Create:**
```
frontend/src/app/dashboard/projects/new/page.tsx
frontend/src/components/projects/ProjectForm.tsx
frontend/src/components/projects/ProjectFormFields.tsx
frontend/src/lib/validations/project.ts
```

**API Integration:**
- POST /api/projects
- Current user automatically added as first member

---

### Task 2: WBS Builder Interface 🌳
**Priority**: HIGH  
**Estimated Time**: 8-10 hours

**Requirements:**
- Interactive tree view with drag-drop
- Add/Edit/Delete WBS nodes
- Hierarchical levels (max 5 levels recommended)
- Fields per node:
  - WBS Code (auto-generated or manual)
  - Name
  - Description
  - Weightage (must sum to 100% at each level)
  - Order (for sorting)
- Visual validation (weightage sum indicator)
- Collapsible tree nodes
- Breadcrumb navigation

**Libraries to Install:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable --workspace=frontend
# OR
npm install react-beautiful-dnd --workspace=frontend
```

**Files to Create:**
```
frontend/src/app/dashboard/projects/[id]/wbs/page.tsx
frontend/src/components/wbs/WBSTree.tsx
frontend/src/components/wbs/WBSNode.tsx
frontend/src/components/wbs/WBSNodeForm.tsx
frontend/src/components/wbs/WeightageValidator.tsx
```

**API Integration:**
- GET /api/wbs?projectId={id}
- POST /api/wbs
- PATCH /api/wbs/:id
- DELETE /api/wbs/:id

---

### Task 3: Cost Code Management UI 💰
**Priority**: HIGH  
**Estimated Time**: 6-8 hours

**Requirements:**
- Data table with sorting, filtering, search
- Add/Edit/Delete cost codes
- Link cost codes to WBS elements
- Fields:
  - Cost Code (auto-generate pattern or manual)
  - Name
  - Description
  - Category (Material, Labor, Equipment, Subcontract, etc.)
  - Budget Amount
  - Associated WBS (dropdown)
- Bulk import from CSV/Excel
- Export to Excel

**Libraries to Install:**
```bash
npm install @tanstack/react-table --workspace=frontend
npm install papaparse --workspace=frontend  # CSV parsing
npm install xlsx --workspace=frontend       # Excel import/export
```

**Files to Create:**
```
frontend/src/app/dashboard/projects/[id]/cost-codes/page.tsx
frontend/src/components/cost/CostCodeTable.tsx
frontend/src/components/cost/CostCodeForm.tsx
frontend/src/components/cost/CostCodeImport.tsx
frontend/src/lib/validations/cost-code.ts
```

**API Integration:**
- GET /api/cost/codes?projectId={id}
- POST /api/cost/codes
- PATCH /api/cost/codes/:id
- DELETE /api/cost/codes/:id

---

### Task 4: Budget Entry Forms 📝
**Priority**: MEDIUM  
**Estimated Time**: 4-6 hours

**Requirements:**
- Quick entry form for cost transactions
- Fields:
  - Cost Code (searchable dropdown)
  - Description
  - Amount
  - Entry Date
  - Entry Type (Budget, Actual, Forecast, Commitment)
  - Reference Number
- Batch entry mode (multiple lines)
- Validation (can't exceed budget by too much)
- Attachment upload for supporting docs

**Files to Create:**
```
frontend/src/app/dashboard/projects/[id]/cost-entries/page.tsx
frontend/src/components/cost/CostEntryForm.tsx
frontend/src/components/cost/BatchEntryForm.tsx
frontend/src/components/cost/CostCodeSearch.tsx
```

**API Integration:**
- GET /api/cost/entries?projectId={id}
- POST /api/cost/entries
- GET /api/cost/summary/:projectId

---

### Task 5: Cost Tracking Charts 📊
**Priority**: MEDIUM  
**Estimated Time**: 6-8 hours

**Requirements:**
- Budget vs Actual comparison (Bar chart)
- Cost by Category (Pie/Donut chart)
- Cost trend over time (Line chart)
- Variance analysis (Budget - Actual)
- Interactive tooltips
- Responsive design

**Libraries to Install:**
```bash
npm install recharts --workspace=frontend
# OR
npm install chart.js react-chartjs-2 --workspace=frontend
```

**Files to Create:**
```
frontend/src/components/cost/charts/BudgetVsActualChart.tsx
frontend/src/components/cost/charts/CostByCategoryChart.tsx
frontend/src/components/cost/charts/CostTrendChart.tsx
frontend/src/components/cost/charts/VarianceChart.tsx
```

**Data Required:**
- Aggregate cost data by code, category, date
- Calculate variances
- Format for chart libraries

---

### Task 6: Cost Performance Dashboard 📈
**Priority**: MEDIUM  
**Estimated Time**: 6-8 hours

**Requirements:**
- KPI Cards:
  - Total Budget
  - Total Actual Cost
  - Total Committed Cost
  - Available Budget
  - Variance (Amount & %)
  - Top 5 cost codes by spend
- Summary table with drill-down
- Export to PDF/Excel
- Date range filter
- Category filter

**Files to Create:**
```
frontend/src/app/dashboard/projects/[id]/cost-overview/page.tsx
frontend/src/components/cost/CostKPICard.tsx
frontend/src/components/cost/CostSummaryTable.tsx
frontend/src/components/cost/CostDashboard.tsx
frontend/src/lib/utils/cost-calculations.ts
```

**API Integration:**
- GET /api/cost/summary/:projectId
- Aggregate and calculate on frontend or backend

---

## 🛠️ Technical Stack for Phase 2

### Frontend Libraries
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table (React Table v8)
- **Charts**: Recharts (recommended) or Chart.js
- **Drag & Drop**: @dnd-kit or react-beautiful-dnd
- **Date Pickers**: react-day-picker (already in shadcn/ui)
- **File Upload**: Custom component with Dropzone
- **CSV/Excel**: papaparse + xlsx

### UI Components (shadcn/ui)
Already available:
- Button, Card, Input, Label, Select
- Dialog, Dropdown Menu, Popover
- Table, Badge, Alert

To add:
```bash
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
```

---

## 📐 Design Patterns

### Form Handling
```typescript
// Use React Hook Form + Zod
const form = useForm<ProjectFormData>({
  resolver: zodResolver(projectSchema),
  defaultValues: { ... }
});

const onSubmit = async (data: ProjectFormData) => {
  try {
    await api.projects.create(data);
    toast.success('Project created!');
    router.push('/dashboard/projects');
  } catch (error) {
    toast.error('Failed to create project');
  }
};
```

### Data Fetching
```typescript
// Use TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['projects', projectId],
  queryFn: () => api.projects.getById(projectId)
});
```

### State Management
```typescript
// Use React Query for server state
// Use useState for local UI state
// Use Context for global UI state (theme, etc.)
```

---

## 🧪 Testing Checklist

For each feature:
- [ ] Form validation works
- [ ] API integration successful
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Success notifications appear
- [ ] Responsive on mobile
- [ ] Data persists correctly
- [ ] User permissions respected

---

## 📊 Success Metrics

By end of Phase 2:
- [ ] Users can create projects with full validation
- [ ] Users can build multi-level WBS structure
- [ ] Users can manage cost codes with categories
- [ ] Users can enter budget and actual costs
- [ ] Users can view cost charts and KPIs
- [ ] All features are responsive and user-friendly
- [ ] Data correctly saved to database via API

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
cd frontend

# Install UI components
npx shadcn-ui@latest add form select calendar popover table dialog badge toast

# Install additional libraries
npm install @tanstack/react-table recharts @dnd-kit/core @dnd-kit/sortable papaparse xlsx
npm install --save-dev @types/papaparse
```

### Step 2: Start Development
```bash
# Make sure backend and frontend are running
npm run dev
```

### Step 3: Begin with Task 1
Start with Project Creation Form - the foundation for all other features.

---

## 📝 Notes

- Prioritize user experience and validation
- Mobile-first design approach
- Follow existing code patterns
- Test each feature thoroughly before moving on
- Document any new patterns or utilities
- Update API client types as needed

---

**Start Date**: 22 October 2025  
**Target Completion**: End of Week 4  
**Next Phase**: Phase 3 - Schedule Management
