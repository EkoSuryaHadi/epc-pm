# Phase 3 - Task 4: Schedule Baseline 📊

**Estimated Time:** 2-3 hours  
**Priority:** High ⭐⭐⭐  
**Status:** Ready to implement  
**Date:** October 28, 2025

---

## 📋 Overview

Create baseline functionality to capture schedule snapshots and compare planned vs actual performance. This enables tracking schedule variance, delays, and performance metrics over time.

---

## 🎯 Objectives

1. **Baseline Creation** - Capture current schedule as baseline
2. **Baseline Management** - Update, view, delete baselines
3. **Variance Calculation** - Compare actual vs baseline dates
4. **Visual Comparison** - Show baseline vs actual on Gantt
5. **Baseline Reports** - Summary of variances and delays

---

## 🏗️ Architecture

### Database Schema (Prisma)

```prisma
model ScheduleBaseline {
  id          String   @id @default(cuid())
  projectId   String
  name        String   // "Initial Baseline", "Re-baseline v2"
  description String?
  baselineDate DateTime @default(now()) // When baseline was created
  isActive    Boolean  @default(false) // Only one active baseline per project
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks       ScheduleBaselineTask[]
  
  @@map("schedule_baselines")
}

model ScheduleBaselineTask {
  id              String   @id @default(cuid())
  baselineId      String
  scheduleId      String   // Reference to actual schedule task
  taskName        String
  plannedStart    DateTime
  plannedEnd      DateTime
  plannedDuration Int      // In days
  plannedProgress Int      @default(0)
  wbsId           String?
  createdAt       DateTime @default(now())
  
  baseline        ScheduleBaseline @relation(fields: [baselineId], references: [id], onDelete: Cascade)
  schedule        Schedule         @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  wbs             WBS?             @relation(fields: [wbsId], references: [id])
  
  @@map("schedule_baseline_tasks")
}
```

### Why This Design?
- **Separate baseline tables** - Preserves historical data even if tasks are deleted
- **Link to scheduleId** - Can compare with current schedule
- **isActive flag** - Easy to switch between baselines
- **Multiple baselines** - Support re-baselining during project lifecycle

---

## 📐 Technical Specification

### 1. Backend API Endpoints

**File:** `backend/src/schedule/schedule.controller.ts` & `schedule.service.ts`

```typescript
// Baseline Management
GET    /api/schedule/baselines?projectId={id}       // List all baselines
POST   /api/schedule/baselines                      // Create new baseline
GET    /api/schedule/baselines/:id                  // Get baseline details
PATCH  /api/schedule/baselines/:id                  // Update baseline (name, description)
DELETE /api/schedule/baselines/:id                  // Delete baseline
PATCH  /api/schedule/baselines/:id/activate         // Set as active baseline

// Baseline Comparison
GET    /api/schedule/baselines/:id/variance         // Get variance report
GET    /api/schedule/baselines/:id/tasks            // Get baseline tasks
```

### 2. Frontend Validation Schema

**File:** `frontend/src/lib/validations/baseline.ts`

```typescript
import { z } from 'zod';

export const baselineSchema = z.object({
  name: z.string().min(1, 'Baseline name is required'),
  description: z.string().optional(),
});

export interface ScheduleBaseline {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  baselineDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaselineTask {
  id: string;
  baselineId: string;
  scheduleId: string;
  taskName: string;
  plannedStart: string;
  plannedEnd: string;
  plannedDuration: number;
  plannedProgress: number;
}

export interface VarianceReport {
  taskId: string;
  taskName: string;
  
  // Baseline (Planned)
  plannedStart: string;
  plannedEnd: string;
  plannedDuration: number;
  
  // Actual (Current)
  actualStart: string;
  actualEnd: string;
  actualDuration: number;
  actualProgress: number;
  
  // Variance
  startVariance: number;    // Days (positive = delay)
  endVariance: number;      // Days (positive = delay)
  durationVariance: number; // Days (positive = overrun)
  status: 'On Track' | 'Delayed' | 'Ahead';
}
```

---

### 3. BaselineForm Component

**File:** `frontend/src/components/schedule/BaselineForm.tsx`

**Features:**
- Dialog-based form
- Name field (required)
- Description (optional)
- Create baseline from current schedule
- Checkbox: "Set as active baseline"
- Shows task count preview
- Confirmation: "This will capture {X} tasks"

**Props:**
```typescript
interface BaselineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BaselineFormData) => Promise<void>;
  taskCount: number; // Number of tasks to be baselined
  isLoading?: boolean;
}
```

---

### 4. BaselineTable Component

**File:** `frontend/src/components/schedule/BaselineTable.tsx`

**Features:**
- List all baselines for project
- Columns:
  - Name
  - Description
  - Baseline Date (when created)
  - Task Count
  - Active Status (badge)
  - Actions
- Active baseline: Green badge "Active"
- Actions dropdown:
  - View Details
  - Set as Active
  - View Variance Report
  - Delete

**Sortable Columns:**
- Name
- Baseline Date
- Task Count

---

### 5. Baseline Details Page

**File:** `frontend/src/app/dashboard/projects/[id]/schedule/baseline/[baselineId]/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header: Baseline Name                   │
│ Description | Baseline Date | Active    │
│ Back button | Set Active | Delete        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Tabs: Overview | Tasks | Variance       │
└─────────────────────────────────────────┘

Tab 1: Overview
- Total Tasks: X
- Baseline Date: MMM DD, YYYY
- Created By: User Name
- Status: Active/Inactive

Tab 2: Baseline Tasks
- Table of all baseline tasks
- Columns: Task Name, Planned Start, Planned End, Duration, WBS
- Read-only (historical data)

Tab 3: Variance Report
- Comparison table
- Shows: Task, Baseline vs Actual, Variance
- Color coding: Green (on track), Yellow (minor delay), Red (major delay)
- Summary metrics:
  - Tasks on track
  - Tasks delayed
  - Average delay
```

---

### 6. Baseline Comparison on Gantt

**File:** `frontend/src/components/schedule/GanttChart.tsx` (UPDATE)

**New Feature: Baseline Overlay**

**Visual Design:**
- Regular tasks: Blue bars (actual)
- **Baseline tasks: Gray transparent bars behind** (planned)
- If task delayed: Actual bar extends past baseline
- If ahead: Actual bar shorter than baseline

**Toggle Control:**
- Checkbox: "Show Baseline" (default: unchecked)
- Dropdown: Select which baseline to show

**Implementation Approach:**
```typescript
// Option 1: Add baseline tasks as separate layer
const baselineTasks = baselineData.map(bt => ({
  ...bt,
  id: `baseline-${bt.id}`,
  styles: { 
    backgroundColor: 'rgba(156, 163, 175, 0.3)', // Gray transparent
    borderColor: '#9ca3af'
  }
}));

// Render both actual + baseline
const allTasks = [...actualTasks, ...baselineTasks];
```

---

### 7. Baseline Management Page

**File:** `frontend/src/app/dashboard/projects/[id]/schedule/baseline/page.tsx`

**Features:**
- Header: "Schedule Baselines"
- Button: "Create Baseline"
- BaselineTable component
- Active baseline highlighted
- Quick stats:
  - Total baselines created
  - Current active baseline
  - Last baseline date

**Create Baseline Flow:**
1. User clicks "Create Baseline"
2. BaselineForm opens
3. User enters name & description
4. Checkbox: "Set as active"
5. Shows: "This will capture {X} schedule tasks"
6. User confirms
7. Backend:
   - Creates ScheduleBaseline record
   - Copies all Schedule tasks to ScheduleBaselineTask
   - If "set as active": Updates isActive flags
8. Toast: "Baseline created successfully"
9. Redirect to baseline details page

---

### 8. Variance Report Component

**File:** `frontend/src/components/schedule/VarianceReport.tsx`

**Features:**
- Table with variance data
- Columns:
  - Task Name
  - Planned Start vs Actual Start
  - Planned End vs Actual End
  - Duration Variance
  - Progress
  - Status (badge)
- Status colors:
  - **Green:** On Track (variance ≤ 0)
  - **Yellow:** Minor Delay (0 < variance ≤ 7 days)
  - **Red:** Major Delay (variance > 7 days)
- Summary cards at top:
  - Total Tasks
  - On Track (%)
  - Delayed (%)
  - Average Delay (days)
- Export button: Download as CSV/Excel

---

## 🔄 Data Flow

### Create Baseline Flow:
```
1. User clicks "Create Baseline"
   ↓
2. BaselineForm opens
   ↓
3. User fills name & description
   ↓
4. User clicks "Create"
   ↓
5. Frontend calls: POST /api/schedule/baselines
   {
     projectId: "...",
     name: "Initial Baseline",
     description: "...",
     setAsActive: true
   }
   ↓
6. Backend:
   - Create ScheduleBaseline record
   - Get all Schedule tasks for project
   - For each task:
     * Create ScheduleBaselineTask
     * Copy: name, startDate, endDate, duration, progress, wbsId
   - If setAsActive: Set isActive = true, others = false
   ↓
7. Return baseline with task count
   ↓
8. Frontend shows toast & refreshes table
```

### Variance Calculation Flow:
```
1. User clicks "View Variance" on baseline
   ↓
2. Frontend calls: GET /api/schedule/baselines/:id/variance
   ↓
3. Backend:
   - Get BaselineTask records for baseline
   - Get current Schedule tasks
   - For each task:
     * Calculate startVariance = actualStart - plannedStart (in days)
     * Calculate endVariance = actualEnd - plannedEnd (in days)
     * Calculate durationVariance = actualDuration - plannedDuration
     * Determine status:
       - On Track: all variances ≤ 0
       - Delayed: any variance > 0
       - Ahead: variances < 0
   ↓
4. Return variance report array
   ↓
5. Frontend displays in VarianceReport component
```

---

## 🎨 UI/UX Design

### Baseline Badge:
- **Active:** Green badge with checkmark icon
- **Inactive:** Gray badge

### Variance Status Colors:
- **On Track:** Green badge (`bg-green-100 text-green-800`)
- **Minor Delay:** Yellow badge (`bg-yellow-100 text-yellow-800`)
- **Major Delay:** Red badge (`bg-red-100 text-red-800`)
- **Ahead:** Blue badge (`bg-blue-100 text-blue-800`)

### Baseline on Gantt:
- Baseline bars: Light gray, 40% opacity, dashed border
- Actual bars: Normal colors (blue/red)
- Overlap: Shows variance visually

---

## 🧪 Testing Checklist

### CRUD Operations:
- [ ] Create baseline → Success, captures all tasks
- [ ] View baseline details → Shows all baseline tasks
- [ ] Update baseline name/description → Updates correctly
- [ ] Delete baseline → Removes from list
- [ ] Set as active → Updates active flag, others deactivated

### Variance Calculation:
- [ ] Delayed task → Shows positive variance, red status
- [ ] On-track task → Shows zero/negative variance, green status
- [ ] Early task → Shows negative variance, ahead status
- [ ] Summary stats → Correct percentages and averages

### Gantt Integration:
- [ ] Toggle "Show Baseline" → Baseline bars appear/disappear
- [ ] Baseline bars → Gray, transparent, behind actual bars
- [ ] Delayed task → Actual bar extends past baseline
- [ ] Correct positioning on timeline

### Edge Cases:
- [ ] Project with no tasks → Cannot create baseline
- [ ] Task deleted after baseline → Still shows in baseline
- [ ] Multiple baselines → Only one active at a time
- [ ] Re-baseline → New baseline captures current state

---

## 📊 Sample Data for Testing

### Scenario: Project with Delays

**Initial Baseline (Week 0):**
- Task A: Week 1-2 (planned)
- Task B: Week 3-4 (planned)
- Task C: Week 5-6 (planned)

**Current Schedule (Week 4):**
- Task A: Week 1-3 (actual) - **1 week delay**
- Task B: Week 3-5 (actual, in progress) - **1 week delay**
- Task C: Week 5-6 (planned) - **On track**

**Expected Variance:**
- Task A: +7 days end variance, RED
- Task B: +7 days (ongoing), YELLOW
- Task C: 0 days, GREEN

---

## 🔧 Implementation Plan

### Phase 1: Database & Backend (60 min)
1. Update Prisma schema
2. Run migration
3. Add baseline controller methods
4. Add baseline service methods
5. Test API endpoints with Postman/curl

### Phase 2: Frontend Components (60 min)
6. Create baseline validation schema
7. Create BaselineForm component
8. Create BaselineTable component
9. Create VarianceReport component
10. Create baseline management page

### Phase 3: Variance & Integration (45 min)
11. Implement variance calculation
12. Add baseline to Gantt chart
13. Create baseline details page
14. Add baseline toggle/selector
15. Link from schedule page

### Phase 4: Testing & Polish (15-30 min)
16. Test create baseline flow
17. Test variance calculation
18. Test Gantt baseline overlay
19. Test set active functionality
20. UI/UX improvements

---

## ⚠️ Important Notes

### Baseline Best Practices:
1. **Create baseline early** - Before project starts or after planning
2. **Don't modify baseline** - It's historical data
3. **Re-baseline when needed** - Major changes, scope changes
4. **Only one active** - Prevents confusion
5. **Keep descriptions** - Note why baseline was created

### Data Integrity:
- Baseline tasks are **snapshots** - don't update with schedule
- If schedule task deleted, baseline task remains
- Baseline is **read-only** historical data
- Can delete entire baseline, but not individual tasks

### Performance Considerations:
- Large projects (1000+ tasks) - May need pagination for baseline tasks
- Variance calculation - Consider caching for large datasets
- Gantt rendering - Load baseline only when toggled on

---

## 📚 User Stories

**As a Project Manager:**
- I want to create a schedule baseline so that I can track progress against the plan
- I want to see variance reports so that I can identify delayed tasks
- I want to visualize baseline vs actual on Gantt so that I can communicate status

**As a Team Member:**
- I want to see if tasks are on track or delayed so that I can prioritize work
- I want to understand schedule impact so that I can adjust plans

**As a Stakeholder:**
- I want to see schedule performance metrics so that I can assess project health
- I want to know if project is on schedule so that I can make informed decisions

---

## 🎯 Success Criteria

Task 4 complete when:
- ✅ Can create baseline from current schedule
- ✅ Can view all baselines for project
- ✅ Can set active baseline
- ✅ Can view variance report
- ✅ Variance calculation accurate
- ✅ Baseline shows on Gantt chart
- ✅ Can toggle baseline on/off
- ✅ Summary stats correct
- ✅ All tests passing
- ✅ No console errors

---

## 💡 Future Enhancements

1. **Baseline Comparison** - Compare multiple baselines
2. **Baseline Templates** - Pre-defined baseline types
3. **Automatic Re-baseline** - Trigger after X% variance
4. **Baseline Approvals** - Require manager approval
5. **Baseline History** - Timeline of all baselines
6. **Export Reports** - PDF variance reports
7. **Email Alerts** - Notify on major variances
8. **Baseline Comments** - Add notes to baselines

---

## 📝 API Client Updates

**File:** `frontend/src/lib/api-client.ts` (ADD)

```typescript
schedule: {
  // Existing methods...
  
  // Baseline methods
  getBaselines: (projectId: string) => 
    client.get(`/schedule/baselines?projectId=${projectId}`),
  getBaseline: (id: string) => 
    client.get(`/schedule/baselines/${id}`),
  createBaseline: (data: any) => 
    client.post('/schedule/baselines', data),
  updateBaseline: (id: string, data: any) => 
    client.patch(`/schedule/baselines/${id}`, data),
  deleteBaseline: (id: string) => 
    client.delete(`/schedule/baselines/${id}`),
  activateBaseline: (id: string) => 
    client.patch(`/schedule/baselines/${id}/activate`),
  getVarianceReport: (id: string) => 
    client.get(`/schedule/baselines/${id}/variance`),
  getBaselineTasks: (id: string) => 
    client.get(`/schedule/baselines/${id}/tasks`),
}
```

---

## 🚀 Ready to Implement?

**Estimated Time:** 2-3 hours  
**Complexity:** Medium-High  
**Dependencies:** Schedule & Task management working  
**Risk Level:** Medium (variance calculation needs accuracy)

**Confirm to proceed:**
- User confirmed testing complete for Task 3
- Ready to start Task 4 implementation
- Backend and frontend servers running

---

**Shall we begin implementation?** 🎯
