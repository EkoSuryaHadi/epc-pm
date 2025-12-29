# 🧪 Milestone Tracking - Testing Guide

**Date:** October 28, 2025  
**Feature:** Phase 3 - Task 3 - Milestone Tracking  
**Status:** Ready for Testing

---

## 🚀 Servers Started

✅ **Backend:** http://localhost:3001  
✅ **Frontend:** http://localhost:3000

---

## 📋 Testing Checklist

### 1️⃣ **Navigation Test** (2 minutes)

**Steps:**
1. Open browser: http://localhost:3000
2. Login with your credentials
3. Navigate to **Projects** page
4. Select any project (or create one if none exist)
5. Look for **"Milestones"** button in project card

**Expected Results:**
- ✅ "Milestones" button visible in project card (third row)
- ✅ Button is clickable
- ✅ Clicking navigates to `/dashboard/projects/{id}/milestones`

---

### 2️⃣ **Milestones Page Load** (1 minute)

**Steps:**
1. Click "Milestones" button on a project
2. Wait for page to load

**Expected Results:**
- ✅ Page title: "Milestones" with flag icon
- ✅ Breadcrumb: "Projects / {ProjectName} / Milestones"
- ✅ "Add Milestone" button visible
- ✅ "View Schedule" button visible
- ✅ "Back" button visible
- ✅ Empty table with message: "No milestones found. Click 'Add Milestone' to create one."

---

### 3️⃣ **Create Milestone Test** (5 minutes)

**Test Case 1: Create Normal Milestone**

**Steps:**
1. Click **"Add Milestone"** button
2. Dialog opens with form
3. Fill in fields:
   - **Name:** "Project Kickoff"
   - **Description:** "Official project start meeting"
   - **Target Date:** Select tomorrow's date
   - **Actual Date:** Leave empty
   - **Status:** Select "Pending"
   - **Critical:** Leave unchecked
4. Click **"Create"** button

**Expected Results:**
- ✅ Dialog closes
- ✅ Toast notification: "Milestone created successfully"
- ✅ New milestone appears in table
- ✅ Name: "Project Kickoff"
- ✅ Status badge: Yellow/Amber (Pending)
- ✅ No red flag icon (not critical)
- ✅ Target date formatted correctly (e.g., "Oct 29, 2025")
- ✅ Actual Date: "Not achieved"

**Test Case 2: Create Critical Milestone**

**Steps:**
1. Click **"Add Milestone"** again
2. Fill in fields:
   - **Name:** "Phase 1 Complete"
   - **Description:** "Completion of first phase"
   - **Target Date:** Select next week
   - **Status:** "Pending"
   - **Critical:** ✅ Check this box
3. Click **"Create"**

**Expected Results:**
- ✅ Toast notification: "Milestone created successfully"
- ✅ Milestone appears with **red flag icon** 🚩
- ✅ Flag indicates it's critical
- ✅ Status badge: Yellow (Pending)

**Test Case 3: Create Achieved Milestone**

**Steps:**
1. Click **"Add Milestone"** again
2. Fill in:
   - **Name:** "Requirement Gathering Done"
   - **Target Date:** Yesterday
   - **Actual Date:** Yesterday (same date)
   - **Status:** "Achieved"
   - **Critical:** Unchecked
3. Click **"Create"**

**Expected Results:**
- ✅ Milestone appears
- ✅ Status badge: **Green** (Achieved)
- ✅ Actual Date shows the date you selected
- ✅ No critical flag

---

### 4️⃣ **Edit Milestone Test** (3 minutes)

**Steps:**
1. Find "Project Kickoff" milestone in table
2. Click **⋮** (three dots) menu button
3. Select **"Edit"**
4. Dialog opens with pre-filled data
5. Verify all fields are populated correctly
6. Change **Name** to "Project Kickoff Meeting"
7. Change **Status** to "Delayed"
8. Click **"Update"**

**Expected Results:**
- ✅ Dialog closes
- ✅ Toast: "Milestone updated successfully"
- ✅ Name changes to "Project Kickoff Meeting"
- ✅ Status badge changes to **Red** (Delayed)
- ✅ Table updates immediately

---

### 5️⃣ **Delete Milestone Test** (2 minutes)

**Steps:**
1. Find "Requirement Gathering Done" milestone
2. Click **⋮** menu
3. Select **"Delete"**
4. Confirmation dialog appears
5. Click **"Delete"** to confirm

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Dialog text: "Are you sure you want to delete this milestone?"
- ✅ After confirming, toast: "Milestone deleted successfully"
- ✅ Milestone removed from table
- ✅ Table updates immediately

**Cancel Test:**
1. Try deleting another milestone
2. Click **"Cancel"** in confirmation dialog
3. ✅ Dialog closes, milestone NOT deleted

---

### 6️⃣ **Search & Filter Test** (3 minutes)

**Prerequisites:** Have at least 3 milestones with different statuses

**Search Test:**
1. Type "Project" in search box
2. ✅ Table filters to show only milestones with "Project" in name
3. Clear search
4. ✅ All milestones reappear

**Filter Test:**
1. Click status filter dropdown
2. Select **"Pending"**
3. ✅ Table shows only Pending milestones
4. Select **"Achieved"**
5. ✅ Table shows only Achieved milestones
6. Select **"Delayed"**
7. ✅ Table shows only Delayed milestones
8. Select **"All Status"**
9. ✅ All milestones visible again

---

### 7️⃣ **Sort Test** (2 minutes)

**Steps:**
1. Click **"Milestone Name"** column header
2. ✅ Table sorts alphabetically A-Z
3. Click again
4. ✅ Table sorts reverse Z-A
5. Click **"Target Date"** column header
6. ✅ Table sorts by date (earliest first)
7. Click again
8. ✅ Sorts by date (latest first)
9. Click **"Status"** column header
10. ✅ Table sorts by status

---

### 8️⃣ **Pagination Test** (2 minutes)

**Prerequisites:** Create 15+ milestones (use quick names: "M1", "M2", etc.)

**Steps:**
1. Create 15 milestones
2. ✅ Only 10 visible per page
3. ✅ "Next" button enabled
4. Click **"Next"**
5. ✅ Shows milestones 11-15
6. ✅ "Previous" button enabled
7. Click **"Previous"**
8. ✅ Back to first 10 milestones
9. Check footer
10. ✅ Shows total count: "15 milestone(s) total"

---

### 9️⃣ **Gantt Chart Integration Test** (5 minutes)

**Steps:**
1. Go back to project page
2. Click **"Gantt Chart"** button
3. Gantt page loads with schedule tasks
4. Check for milestones on chart

**Expected Results:**
- ✅ Milestones appear as diamond markers with **◆** symbol
- ✅ Milestone names prefixed with diamond: "◆ Project Kickoff"
- ✅ Milestones positioned at correct dates on timeline
- ✅ Regular milestones: **Purple color** (#a855f7)
- ✅ Critical milestones: **Red color** (#ef4444)

**Toggle Test:**
1. Find **"Show Milestones"** checkbox in controls
2. ✅ Checkbox is checked by default
3. Uncheck "Show Milestones"
4. ✅ Milestones disappear from chart
5. Check again
6. ✅ Milestones reappear

**Click Test:**
1. Click on a milestone marker on Gantt
2. ✅ Toast notification appears
3. ✅ Toast shows: "Milestone - {Name} - Status: {Status}"

**Legend Test:**
1. Look at the legend on right side
2. ✅ Shows "Regular Task" (blue)
3. ✅ Shows "Critical Task" (red)
4. ✅ Shows "Milestone" (purple) ⭐ NEW

---

### 🔟 **Form Validation Test** (3 minutes)

**Required Field Test:**
1. Click "Add Milestone"
2. Leave **Name** empty
3. Click "Create"
4. ✅ Error message: "Milestone name is required"
5. Leave **Target Date** empty
6. ✅ Error message: "Target date is required"

**Date Logic Test:**
1. Fill all required fields
2. Set **Actual Date** but leave status as "Pending"
3. ✅ Should still save (user decides status manually)

**Cancel Test:**
1. Fill form halfway
2. Click **"Cancel"**
3. ✅ Dialog closes
4. ✅ No milestone created
5. ✅ Form resets when reopened

---

## 🎨 Visual Verification

### Status Badge Colors:
- **Achieved:** Green badge with green text
- **Pending:** Yellow/Amber badge with amber text
- **Delayed:** Red badge with red text

### Critical Indicators:
- **Table:** Red flag icon 🚩 next to milestone name
- **Gantt:** Red color for entire milestone marker

### Date Formatting:
- Format: "MMM dd, yyyy" (e.g., "Oct 28, 2025")
- Not achieved: Shows "Not achieved" in gray text

### Icons:
- **Flag icon** in page header
- **Red flag** for critical milestones
- **Calendar icon** in date pickers
- **Search icon** in search box
- **Filter icon** in filter dropdown

---

## 🐛 Bug Reporting Template

If you find any issues, please note:

```markdown
**Bug:** [Short description]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** [If applicable]
**Console Errors:** [Open DevTools > Console, copy any red errors]
```

---

## ✅ Success Criteria

**All Tests Passed When:**
- ✅ Can create milestones with all field combinations
- ✅ Can edit milestones (form pre-fills correctly)
- ✅ Can delete milestones (with confirmation)
- ✅ Status badges show correct colors
- ✅ Critical milestones show red flag
- ✅ Search filters correctly
- ✅ Status filter works
- ✅ Sort columns work
- ✅ Pagination works (if 10+ milestones)
- ✅ Milestones appear on Gantt chart
- ✅ Milestone colors correct (purple/red)
- ✅ Toggle show/hide works
- ✅ Click milestone shows toast
- ✅ No console errors
- ✅ All buttons and links work

---

## 🔧 Troubleshooting

### If page doesn't load:
```bash
# Check if servers are running
# Backend: http://localhost:3001/health
# Frontend: http://localhost:3000

# Restart servers if needed
cd E:\Project\epc
START_BACKEND.bat
START_DEV_SERVER.bat
```

### If API errors occur:
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Check failed requests
4. Look at Console tab for errors
5. Report errors to me

### If milestones don't show on Gantt:
1. Check if "Show Milestones" checkbox is checked
2. Verify milestones exist (go to Milestones page)
3. Check if dates are within Gantt view range
4. Try changing Gantt view mode (Day/Week/Month)

---

## 📊 Quick Test Data

**For Quick Testing, Create These Milestones:**

1. **Project Start**
   - Target: Today
   - Status: Achieved
   - Actual: Today
   - Critical: Yes

2. **Design Phase Complete**
   - Target: +7 days
   - Status: Pending
   - Critical: No

3. **Development Start**
   - Target: +14 days
   - Status: Pending
   - Critical: Yes

4. **Testing Complete**
   - Target: +30 days
   - Status: Pending
   - Critical: Yes

5. **Project Delivery**
   - Target: +45 days
   - Status: Pending
   - Critical: Yes

---

## 🎯 Testing Summary

After completing all tests, you should have:
- ✅ 3-5 test milestones created
- ✅ Mix of Pending/Achieved/Delayed statuses
- ✅ Mix of critical and normal milestones
- ✅ All CRUD operations working
- ✅ Milestones visible on Gantt chart
- ✅ All filters and search working
- ✅ Zero console errors

---

**Happy Testing! 🚀**

Report any issues and I'll fix them immediately.
