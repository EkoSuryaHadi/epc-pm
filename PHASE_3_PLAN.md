# Phase 3: Schedule Management - Implementation Plan

**Start Date**: 27 October 2025  
**Estimated Duration**: 2-3 weeks (12-16 hours)  
**Status**: 🚀 READY TO START  

---

## 🎯 Phase 3 Overview

### Focus: Interactive Schedule Management & Gantt Chart
Build comprehensive schedule control system with:
- Interactive Gantt chart visualization
- Task dependencies and critical path
- Milestone tracking
- Resource allocation
- Progress monitoring

---

## 📋 Tasks Breakdown

### Task 1: Schedule Data Management (PRIORITY: HIGH)
**Estimated Time**: 3-4 hours

**Requirements:**
- Schedule tasks CRUD operations
- Task form with all fields (name, dates, duration, progress, resources)
- Task list/table view
- Link tasks to WBS elements
- Predecessor/dependency definition

**Files to Create:**
```
frontend/src/app/dashboard/projects/[id]/schedule/page.tsx
frontend/src/components/schedule/TaskForm.tsx
frontend/src/components/schedule/TaskTable.tsx
frontend/src/lib/validations/schedule.ts
```

**Backend:**
- Already exists: Schedule API module
- Verify: GET, POST, PATCH, DELETE endpoints

**Data Model (from Prisma):**
```typescript
interface Schedule {
  id: string;
  projectId: string;
  wbsId?: string;
  taskName: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number; // 0-100
  isCritical: boolean;
  predecessors: string[]; // array of task IDs
  resources: string[]; // array of resource names
  plannedHours?: number;
  actualHours?: number;
}
```

---

### Task 2: Gantt Chart Component (PRIORITY: HIGH)
**Estimated Time**: 4-5 hours

**Requirements:**
- Interactive Gantt chart visualization
- Timeline with dates (days, weeks, months view)
- Task bars with progress indication
- Dependency arrows between tasks
- Critical path highlighting
- Drag to reschedule (optional for v1)
- Zoom in/out timeline

**Libraries to Consider:**
1. **dhtmlx-gantt** (Commercial, free trial)
2. **frappe-gantt** (Open source, simple)
3. **react-gantt-timeline** (React-specific)
4. **Custom with D3.js** (Full control)

**Recommendation**: Start with **frappe-gantt** (lightweight, open source)

**Files to Create:**
```
frontend/src/components/schedule/GanttChart.tsx
frontend/src/components/schedule/GanttTimeline.tsx
frontend/src/lib/utils/gantt-helpers.ts
```

**Features:**
- Task bars with start/end dates
- Progress overlay (colored fill)
- Dependency lines
- Critical path (red color)
- Today marker line
- Hover tooltips with task details

---

### Task 3: Milestone Management (PRIORITY: MEDIUM)
**Estimated Time**: 2-3 hours

**Requirements:**
- Milestone CRUD operations
- Milestone form (name, target date, actual date, status)
- Milestone list view
- Critical milestone marking
- Integration with Gantt chart (diamond markers)
- Status indicators (Pending, Achieved, Delayed)

**Files to Create:**
```
frontend/src/components/schedule/MilestoneForm.tsx
frontend/src/components/schedule/MilestoneList.tsx
frontend/src/lib/validations/milestone.ts
```

**Data Model:**
```typescript
interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'Pending' | 'Achieved' | 'Delayed';
  critical: boolean;
}
```

---

### Task 4: Critical Path Analysis (PRIORITY: MEDIUM)
**Estimated Time**: 2-3 hours

**Requirements:**
- Calculate critical path using CPM algorithm
- Identify tasks with zero float/slack
- Highlight critical tasks in Gantt chart
- Show total project duration
- Display float/slack for each task
- Warning indicators for critical tasks

**Algorithm:**
- Forward pass (calculate Early Start, Early Finish)
- Backward pass (calculate Late Start, Late Finish)
- Calculate float: Float = LS - ES or LF - EF
- Critical path: tasks with Float = 0

**Files to Create:**
```
frontend/src/lib/utils/critical-path.ts
frontend/src/components/schedule/CriticalPathPanel.tsx
```

**Features:**
- Auto-calculate on task dependency changes
- Visual indication (red bars in Gantt)
- Critical path report/summary
- Float/slack display

---

### Task 5: Schedule Dashboard (PRIORITY: MEDIUM)
**Estimated Time**: 2-3 hours

**Requirements:**
- Schedule KPI cards:
  - Total tasks
  - Completed tasks
  - In-progress tasks
  - Delayed tasks
  - Critical tasks count
  - On-time percentage
- Schedule summary table
- Upcoming milestones widget
- Task status distribution (pie chart)
- Schedule variance chart

**Files to Create:**
```
frontend/src/app/dashboard/projects/[id]/schedule-dashboard/page.tsx
frontend/src/components/schedule/ScheduleKPIs.tsx
frontend/src/components/schedule/UpcomingMilestones.tsx
```

---

## 🔧 Technology Stack

### Libraries to Install
```bash
# Gantt Chart
npm install frappe-gantt --workspace=frontend

# Date utilities (already have date-fns)
# Charts (already have recharts)
```

### Backend (Already Available)
- **Schedule API**: `/api/schedule`
- **Milestones API**: `/api/schedule/milestones`
- Database models: Schedule, Milestone

### Frontend Components Needed
- TaskForm (create/edit tasks)
- TaskTable (list view with sorting/filtering)
- GanttChart (main visualization)
- MilestoneForm (create/edit milestones)
- MilestoneList (milestone tracking)
- CriticalPathPanel (analysis view)
- ScheduleKPIs (dashboard metrics)

---

## 📐 Implementation Priority

### Week 1 (High Priority)
1. ✅ Task 1: Schedule Data Management (3-4h)
2. ✅ Task 2: Gantt Chart Component (4-5h)

**Deliverable**: Working schedule CRUD with Gantt visualization

### Week 2 (Medium Priority)
3. ✅ Task 3: Milestone Management (2-3h)
4. ✅ Task 4: Critical Path Analysis (2-3h)
5. ✅ Task 5: Schedule Dashboard (2-3h)

**Deliverable**: Complete schedule management system

---

## 🎨 UI/UX Design

### Schedule Page Layout
```
┌─────────────────────────────────────────┐
│ Header + Breadcrumbs                    │
├─────────────────────────────────────────┤
│ Toolbar: [+ Add Task] [View Options]   │
├─────────────────────────────────────────┤
│ Gantt Chart (Main Area)                 │
│ ┌───────────────────────────────────┐  │
│ │ Task List | Timeline              │  │
│ │ ─────────┼───────────────────────│  │
│ │ Task 1   │ ████████              │  │
│ │ Task 2   │   ██████              │  │
│ │ Task 3   │     ████████          │  │
│ └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ Milestones Timeline                     │
└─────────────────────────────────────────┘
```

### Color Scheme
- **Normal tasks**: Blue (#3b82f6)
- **Critical path**: Red (#ef4444)
- **Completed**: Green (#10b981)
- **In progress**: Orange (#f59e0b)
- **Dependencies**: Gray arrows
- **Milestones**: Diamond markers (gold)

---

## ✅ Success Criteria

### Must Have (MVP)
- ✅ Create and edit schedule tasks
- ✅ Display tasks in Gantt chart
- ✅ Show task dependencies
- ✅ Identify and highlight critical path
- ✅ Create and track milestones
- ✅ Basic schedule metrics

### Nice to Have (v2)
- Drag-and-drop task rescheduling
- Resource allocation view
- Baseline comparison
- What-if scenario analysis
- Export to MS Project format
- Print Gantt chart

---

## 🧪 Testing Checklist

- [ ] Create task with all fields
- [ ] Edit existing task
- [ ] Delete task
- [ ] Set task dependencies (predecessors)
- [ ] View Gantt chart
- [ ] Zoom timeline (day/week/month)
- [ ] See dependency arrows
- [ ] Critical path highlighted
- [ ] Create milestone
- [ ] Track milestone status
- [ ] View schedule KPIs
- [ ] Filter tasks by status
- [ ] Sort tasks by various fields
- [ ] Link task to WBS element

---

## 📊 Phase 3 Timeline

| Week | Tasks | Hours | Status |
|------|-------|-------|--------|
| 1 | Tasks 1-2 | 7-9h | Pending |
| 2 | Tasks 3-5 | 6-9h | Pending |
| **Total** | **5 tasks** | **13-18h** | **0%** |

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
cd E:\Project\epc
npm install frappe-gantt --workspace=frontend
```

### Step 2: Verify Backend APIs
Check existing endpoints:
- GET /api/schedule?projectId={id}
- POST /api/schedule
- PATCH /api/schedule/:id
- DELETE /api/schedule/:id
- GET /api/schedule/milestones?projectId={id}
- POST /api/schedule/milestones

### Step 3: Create Test Data
Create seed script for schedule tasks and milestones.

### Step 4: Start with Task 1
Build schedule data management (forms + table).

---

## 📝 Notes

- Backend schedule API already exists from Phase 1
- Database schema supports all required fields
- Focus on user experience and visualization
- Gantt chart is the centerpiece - make it great!
- Critical path calculation is complex - start simple
- Integration with WBS from Phase 2

---

**Ready to start Task 1?** 🚀

Let me know and we'll begin with Schedule Data Management!
