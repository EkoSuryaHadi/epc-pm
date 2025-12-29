# 🧪 Phase 6 Testing Guide - Risk Management

**Test Date:** October 29, 2025  
**Tester:** User  
**Phase:** Phase 6 - Risk Management  
**Status:** Ready for Testing

---

## 🎯 Testing Objectives

Verify that all Risk Management and Change Order features work correctly:
1. Risk CRUD operations
2. Risk score calculations
3. Risk matrix visualization
4. Change order management
5. Search and filtering
6. Navigation integration

---

## 📋 Pre-Testing Checklist

### 1. Verify Servers Running

**Backend (Port 3001):**
```bash
# Terminal 1
cd E:\Project\epc\backend
npm run start:dev
```

**Expected:** Server running on http://localhost:3001

**Frontend (Port 3000):**
```bash
# Terminal 2
cd E:\Project\epc\frontend
npm run dev
```

**Expected:** Server running on http://localhost:3000

### 2. Login
- URL: http://localhost:3000
- Email: `admin@epc.com`
- Password: `admin123`

### 3. Navigate to Project
- Click on any project
- Verify "Risks" button is visible

---

## 🧪 Test Cases

### Test Group 1: Risk Register Page ✅

#### Test 1.1: Page Load
**Steps:**
1. Click "Risks" button on project card
2. Verify page loads without errors

**Expected Results:**
- ✅ Page title: "Risk Management"
- ✅ Subtitle: "Identify, assess, and mitigate project risks"
- ✅ "Add Risk" button visible
- ✅ "Risk Matrix" button visible
- ✅ 5 statistics cards displayed:
  - Total Risks
  - Extreme Risk
  - High Risk
  - Medium Risk
  - Active Risks
- ✅ Risk Register table visible
- ✅ No console errors

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.2: Empty State
**Steps:**
1. If no risks exist, verify empty state

**Expected Results:**
- ✅ Message: "No risks identified yet"
- ✅ Empty state is user-friendly

**Status:** [ ] Pass [ ] Fail [ ] N/A

---

### Test Group 2: Create Risk ✅

#### Test 2.1: Open Create Form
**Steps:**
1. Click "Add Risk" button

**Expected Results:**
- ✅ Dialog opens
- ✅ Title: "Add New Risk"
- ✅ All fields visible:
  - Risk Title (required)
  - Description (required)
  - Category (dropdown with 10 options)
  - Risk Owner (required)
  - Probability (1-5 scale)
  - Impact (1-5 scale)
  - Status (dropdown)
  - Mitigation Strategy
- ✅ Cancel and Add Risk buttons visible

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.2: Form Validation
**Steps:**
1. Try to submit empty form
2. Verify validation errors appear

**Expected Results:**
- ✅ Error: "Title is required"
- ✅ Error: "Description is required"
- ✅ Error: "Category is required"
- ✅ Error: "Owner is required"
- ✅ Form does not submit
- ✅ Red error messages displayed

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.3: Risk Score Calculation
**Steps:**
1. Fill form with valid data:
   - Title: "Test Risk 1"
   - Description: "This is a test risk"
   - Category: "Technical"
   - Owner: "John Doe"
   - Probability: 3 (Medium)
   - Impact: 4 (Major)
   - Status: "Identified"
   - Mitigation: "Monitor closely"

2. Observe risk score display

**Expected Results:**
- ✅ Risk Score box appears
- ✅ Score displayed: **12** (3 × 4)
- ✅ Calculation shown: "3 × 4 = 12"
- ✅ Badge displays: "Medium Risk" (Yellow)
- ✅ No alert icon (score < 15)

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.4: Extreme Risk Alert
**Steps:**
1. Change probability to 5 (Very High)
2. Change impact to 5 (Catastrophic)
3. Observe score changes

**Expected Results:**
- ✅ Risk Score: **25** (5 × 5)
- ✅ Badge displays: "Extreme Risk" (Red)
- ✅ Alert icon appears with message: "Immediate action required!"

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.5: Submit Create Risk
**Steps:**
1. Set probability back to 3, impact to 4
2. Click "Add Risk" button

**Expected Results:**
- ✅ Form submits successfully
- ✅ Dialog closes
- ✅ Success toast: "Risk created successfully"
- ✅ Risk appears in table
- ✅ Statistics update (Total Risks increases)
- ✅ Risk shows in correct position (sorted by score)

**Status:** [ ] Pass [ ] Fail

---

### Test Group 3: Risk Table Display ✅

#### Test 3.1: Table Columns
**Steps:**
1. Verify all columns display correctly

**Expected Results:**
- ✅ Columns visible:
  - Risk Title (with description preview)
  - Category
  - Owner
  - Probability (badge)
  - Impact (badge)
  - Risk Score (color-coded badge)
  - Status (color-coded badge)
  - Created date
  - Actions (Edit, Delete)

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.2: Risk Score Badge Colors
**Steps:**
1. Create risks with different scores:
   - Score 3: P=1, I=3 (Very Low - Green)
   - Score 7: P=1, I=7 or P=7, I=1 (Low - Blue)
   - Score 12: P=3, I=4 (Medium - Yellow)
   - Score 16: P=4, I=4 (High - Orange)
   - Score 25: P=5, I=5 (Extreme - Red)

**Expected Results:**
- ✅ Score 1-4: Green badge
- ✅ Score 5-9: Blue badge
- ✅ Score 10-14: Yellow badge
- ✅ Score 15-19: Orange badge + alert icon
- ✅ Score 20-25: Red badge + alert icon

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.3: Sorting
**Steps:**
1. Verify risks are sorted by risk score (highest first)

**Expected Results:**
- ✅ Highest score risk at top
- ✅ Lowest score risk at bottom
- ✅ Automatic sorting

**Status:** [ ] Pass [ ] Fail

---

### Test Group 4: Search and Filter ✅

#### Test 4.1: Search Functionality
**Steps:**
1. Type "Test" in search box
2. Verify filtering

**Expected Results:**
- ✅ Only risks matching "Test" in title/description/category show
- ✅ Real-time filtering (as you type)
- ✅ Clear search shows all risks again

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.2: Status Filter
**Steps:**
1. Click status filter dropdown
2. Select "Identified"
3. Verify filtering

**Expected Results:**
- ✅ Dropdown shows all 5 statuses + "All Statuses"
- ✅ Only "Identified" risks show
- ✅ Select "All Statuses" shows all again

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.3: Combined Search + Filter
**Steps:**
1. Enter search term AND select status
2. Verify both filters apply

**Expected Results:**
- ✅ Results match both search AND status
- ✅ Empty state if no matches

**Status:** [ ] Pass [ ] Fail

---

### Test Group 5: Edit Risk ✅

#### Test 5.1: Open Edit Form
**Steps:**
1. Click Edit icon on a risk
2. Verify form opens with existing data

**Expected Results:**
- ✅ Dialog opens
- ✅ Title: "Edit Risk"
- ✅ All fields pre-filled with current values
- ✅ Risk score displays current calculation

**Status:** [ ] Pass [ ] Fail

---

#### Test 5.2: Update Risk
**Steps:**
1. Change probability from 3 to 5
2. Change status to "Mitigating"
3. Update mitigation strategy
4. Click "Update Risk"

**Expected Results:**
- ✅ Risk score updates in form (new calculation)
- ✅ Form submits successfully
- ✅ Success toast: "Risk updated successfully"
- ✅ Table refreshes with new data
- ✅ Risk score badge updates
- ✅ Status badge updates
- ✅ Risk resorts in table (if score changed)

**Status:** [ ] Pass [ ] Fail

---

### Test Group 6: Delete Risk ✅

#### Test 6.1: Delete Confirmation
**Steps:**
1. Click Delete icon (trash) on a risk
2. Verify confirmation dialog

**Expected Results:**
- ✅ Alert dialog appears
- ✅ Title: "Delete Risk"
- ✅ Message: "Are you sure you want to delete this risk? This action cannot be undone."
- ✅ Cancel and Delete buttons

**Status:** [ ] Pass [ ] Fail

---

#### Test 6.2: Cancel Delete
**Steps:**
1. Click "Cancel" in confirmation dialog

**Expected Results:**
- ✅ Dialog closes
- ✅ Risk NOT deleted
- ✅ Risk still in table

**Status:** [ ] Pass [ ] Fail

---

#### Test 6.3: Confirm Delete
**Steps:**
1. Click Delete icon again
2. Click "Delete" button in dialog

**Expected Results:**
- ✅ Success toast: "Risk deleted successfully"
- ✅ Risk removed from table
- ✅ Statistics update (counts decrease)
- ✅ Table refreshes

**Status:** [ ] Pass [ ] Fail

---

### Test Group 7: Risk Matrix ✅

#### Test 7.1: Navigate to Matrix
**Steps:**
1. Click "Risk Matrix" button
2. Verify page loads

**Expected Results:**
- ✅ Page title: "Risk Matrix"
- ✅ Back button visible
- ✅ 5×5 matrix grid displays
- ✅ Legend shows 5 risk levels with colors

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.2: Matrix Cell Colors
**Steps:**
1. Verify matrix cell colors match legend

**Expected Results:**
- ✅ Bottom-left cells: Green (Very Low)
- ✅ Lower-middle cells: Blue (Low)
- ✅ Center cells: Yellow (Medium)
- ✅ Upper-middle cells: Orange (High)
- ✅ Top-right cells: Red (Extreme)
- ✅ Gradient from green to red visible

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.3: Cell Risk Count
**Steps:**
1. Hover over cells with risks
2. Verify tooltips

**Expected Results:**
- ✅ Cell shows risk count badge (e.g., "2 risks")
- ✅ Hover shows tooltip with risk titles
- ✅ Score number displayed in cell
- ✅ Cells with 0 risks show only score

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.4: Summary Statistics
**Steps:**
1. Scroll to bottom of matrix
2. Verify summary cards

**Expected Results:**
- ✅ 5 cards displayed:
  - Very Low Risk (count)
  - Low Risk (count)
  - Medium Risk (count)
  - High Risk (count)
  - Extreme Risk (count)
- ✅ Counts match actual risks
- ✅ Colors match legend

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.5: Matrix Instructions
**Steps:**
1. Scroll to instructions card
2. Verify content

**Expected Results:**
- ✅ Probability scale (1-5) explained
- ✅ Impact scale (1-5) explained
- ✅ Formula displayed: Risk Score = Probability × Impact
- ✅ Threshold mentioned: ≥15 requires attention

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.6: Back Navigation
**Steps:**
1. Click "Back to Risks" button

**Expected Results:**
- ✅ Navigates back to risk register
- ✅ All data preserved

**Status:** [ ] Pass [ ] Fail

---

### Test Group 8: Change Orders ✅

#### Test 8.1: Navigate to Change Orders
**Steps:**
1. Go to projects list
2. Open a project
3. Look for Change Orders button/link

**Note:** Change Orders might be accessed through Risks page or separate button

**Expected Results:**
- ✅ Can access change orders page
- ✅ URL: `/dashboard/projects/[id]/change-orders`

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.2: Change Orders Page Load
**Steps:**
1. Access change orders page

**Expected Results:**
- ✅ Page title: "Change Orders"
- ✅ Subtitle: "Manage project change requests and their impacts"
- ✅ "Create Change Order" button visible
- ✅ 4 summary cards:
  - Total Change Orders
  - Pending
  - Total Cost Impact
  - Total Time Impact
- ✅ Change order table visible

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.3: Create Change Order
**Steps:**
1. Click "Create Change Order"
2. Fill form:
   - Title: "Additional Safety Requirements"
   - Description: "New safety regulations require additional measures"
   - Type: "Scope Change" (📋)
   - Cost Impact: 50000
   - Time Impact: 15
   - Requested By: "Safety Manager"
   - Status: "Pending Review"
   - Justification: "Mandatory compliance"
3. Click "Create Change Order"

**Expected Results:**
- ✅ Form opens with all fields
- ✅ Type dropdown shows 5 types with icons
- ✅ Status dropdown shows 4 states
- ✅ Impact summary shows (in blue box):
  - Cost: "+$50,000 increase" (red)
  - Time: "+15 days delay" (orange/red)
- ✅ Form submits successfully
- ✅ Success toast appears
- ✅ Change order in table

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.4: Change Order Impact Display
**Steps:**
1. Create another change order with negative impacts:
   - Cost Impact: -25000
   - Time Impact: -5
2. Verify color coding

**Expected Results:**
- ✅ Positive cost: Red/orange (increase)
- ✅ Negative cost: Green (savings)
- ✅ Positive time: Red/orange (delay)
- ✅ Negative time: Green (acceleration)
- ✅ Summary cards update totals

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.5: Change Order Table
**Steps:**
1. Verify table displays correctly

**Expected Results:**
- ✅ Columns:
  - Type (icon)
  - Title (with description preview)
  - Requested By
  - Cost Impact (color-coded)
  - Time Impact (color-coded)
  - Status (badge)
  - Request Date
  - Actions (Edit, Delete)
- ✅ Sorted by request date (newest first)

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.6: Edit Change Order
**Steps:**
1. Click Edit on a change order
2. Change status to "Approved"
3. Add approver name
4. Click "Update Change Order"

**Expected Results:**
- ✅ Form pre-fills with data
- ✅ Can update fields
- ✅ Status badge updates in table
- ✅ Success toast appears

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.7: Delete Change Order
**Steps:**
1. Click Delete on a change order
2. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Change order deleted
- ✅ Table updates
- ✅ Summary cards recalculate

**Status:** [ ] Pass [ ] Fail

---

### Test Group 9: Navigation & Integration ✅

#### Test 9.1: Risks Button
**Steps:**
1. Go to projects list page
2. Verify "Risks" button on project card

**Expected Results:**
- ✅ "Risks" button visible
- ✅ Button positioned appropriately
- ✅ Clicking navigates to risks page

**Status:** [ ] Pass [ ] Fail

---

#### Test 9.2: Breadcrumb Navigation
**Steps:**
1. Navigate through: Projects → Risk Register → Risk Matrix
2. Verify navigation works

**Expected Results:**
- ✅ Can go back using browser back button
- ✅ Back to Risks button works
- ✅ All navigation preserves data

**Status:** [ ] Pass [ ] Fail

---

### Test Group 10: Statistics & Calculations ✅

#### Test 10.1: Risk Statistics Accuracy
**Steps:**
1. Create risks with known scores:
   - 3 extreme risks (score ≥20)
   - 2 high risks (score 15-19)
   - 4 medium risks (score 10-14)
2. Verify statistics cards

**Expected Results:**
- ✅ Total Risks: 9
- ✅ Extreme Risk: 3
- ✅ High Risk: 2
- ✅ Medium Risk: 4
- ✅ Active Risks: 9 (if none closed)

**Status:** [ ] Pass [ ] Fail

---

#### Test 10.2: Change Order Total Impacts
**Steps:**
1. Create multiple change orders with various impacts
2. Verify summary cards calculate totals correctly

**Expected Results:**
- ✅ Total Cost Impact = Sum of all cost impacts
- ✅ Total Time Impact = Sum of all time impacts
- ✅ Pending count accurate
- ✅ Color coding correct (red if positive total)

**Status:** [ ] Pass [ ] Fail

---

### Test Group 11: Error Handling ✅

#### Test 11.1: Network Error
**Steps:**
1. Stop backend server
2. Try to create a risk

**Expected Results:**
- ✅ Error toast appears
- ✅ Error message helpful
- ✅ Form doesn't submit
- ✅ No crash

**Status:** [ ] Pass [ ] Fail

---

#### Test 11.2: Validation Errors
**Steps:**
1. Try various invalid inputs
2. Verify error messages

**Expected Results:**
- ✅ Clear error messages
- ✅ Red color on errors
- ✅ Errors clear when fixed

**Status:** [ ] Pass [ ] Fail

---

## 🐛 Bug Tracking

### Bugs Found:

#### Bug #1: [Title]
- **Severity:** [ ] Critical [ ] Major [ ] Minor
- **Description:**
- **Steps to Reproduce:**
- **Expected:**
- **Actual:**
- **Status:** [ ] Open [ ] Fixed

---

## ✅ Test Summary

### Overall Results:
- **Total Test Cases:** 40+
- **Passed:** ___
- **Failed:** ___
- **Skipped/N/A:** ___
- **Pass Rate:** ___%

### Test Groups Status:
- [ ] Group 1: Risk Register Page
- [ ] Group 2: Create Risk
- [ ] Group 3: Risk Table Display
- [ ] Group 4: Search and Filter
- [ ] Group 5: Edit Risk
- [ ] Group 6: Delete Risk
- [ ] Group 7: Risk Matrix
- [ ] Group 8: Change Orders
- [ ] Group 9: Navigation
- [ ] Group 10: Statistics
- [ ] Group 11: Error Handling

### Critical Issues:
- [ ] None found ✅
- [ ] Issues listed below:

---

## 📊 Performance Notes

### Page Load Times:
- Risk Register: ___ seconds
- Risk Matrix: ___ seconds
- Change Orders: ___ seconds

### Responsiveness:
- [ ] Fast (<1s)
- [ ] Acceptable (1-3s)
- [ ] Slow (>3s)

---

## 💡 Suggestions for Improvement:

1. 
2. 
3. 

---

## ✅ Sign-Off

**Testing Completed By:** _______________  
**Date:** _______________  
**Status:** [ ] Approved [ ] Needs Fixes  

**Notes:**

---

**Ready to proceed to Phase 7:** [ ] Yes [ ] No

---

## 🎯 Quick Test Scenarios

### Scenario 1: High-Risk Project (5 min)
1. Create 5 risks with high scores (15-25)
2. Verify they show in matrix top-right area
3. Check alert icons appear
4. Verify statistics show correct counts

### Scenario 2: Change Management (5 min)
1. Create 3 change orders with positive impacts
2. Create 2 change orders with negative impacts
3. Verify total impacts calculated correctly
4. Update one to "Approved" status

### Scenario 3: Risk Lifecycle (5 min)
1. Create risk: Status "Identified"
2. Edit to: Status "Analyzing"
3. Edit to: Status "Mitigating"
4. Edit to: Status "Monitoring"
5. Edit to: Status "Closed"
6. Verify active count decreases when closed

---

**Happy Testing!** 🧪
