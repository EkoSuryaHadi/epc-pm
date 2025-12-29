# 🧪 WBS Builder Testing Guide

**Date**: 22 October 2025  
**Tester**: User  
**Version**: 1.0

---

## 📋 Pre-Test Checklist

Before starting:
- [ ] Servers are running (frontend on 3000, backend on 3001)
- [ ] Logged in as admin@epc.com
- [ ] At least 1 project exists in the system
- [ ] Browser console open (F12) to catch any errors

---

## 🎯 Test Scenario 1: Navigation & Empty State

### Steps:
1. Go to: http://localhost:3000/dashboard/projects
2. Find any project card
3. Click the **"WBS"** button

### Expected Results:
- ✅ Navigate to `/dashboard/projects/[id]/wbs`
- ✅ Breadcrumb shows: Projects / Project Name / WBS
- ✅ Page title: "Work Breakdown Structure"
- ✅ Empty state shows:
  - Tree icon 🌳
  - Message: "No WBS Structure Yet"
  - Button: "Add Root WBS"

### If Error:
- Check browser console
- Check Network tab for API errors
- Share error message

---

## 🎯 Test Scenario 2: Create Root WBS Elements

### Goal: Create 3 root elements totaling 100%

### Test 2.1: First Root Element

**Steps:**
1. Click **"Add Root WBS"** button
2. Dialog opens
3. Fill form:
   ```
   WBS Code: 1
   WBS Name: Engineering & Design
   Description: All engineering and design activities
   Weightage: 30
   Order: 0
   ```
4. Click **"Create"**

**Expected Results:**
- ✅ Success toast: "WBS element created successfully"
- ✅ Dialog closes
- ✅ WBS node appears in tree:
  - Badge: "1"
  - Title: "Engineering & Design"
  - Badge: "30%"
  - Badge: "L0"
  - Blue background color
- ✅ Red alert appears: "Root level weightage total is 30%. It should equal 100%."
- ✅ Summary shows: Total Elements: 1, Root Elements: 1, Root Weightage: 30.00%

### Test 2.2: Second Root Element

**Steps:**
1. Click **"Add Root WBS"** again
2. Fill form:
   ```
   WBS Code: 2
   WBS Name: Procurement
   Description: Equipment and material procurement
   Weightage: 20
   Order: 1
   ```
3. Click **"Create"**

**Expected Results:**
- ✅ Second node appears below first
- ✅ Red alert now shows: "50%"
- ✅ Summary: Total Elements: 2, Root Weightage: 50.00%

### Test 2.3: Third Root Element (Complete 100%)

**Steps:**
1. Click **"Add Root WBS"**
2. Fill form:
   ```
   WBS Code: 3
   WBS Name: Construction
   Description: All construction and installation work
   Weightage: 50
   Order: 2
   ```
3. Click **"Create"**

**Expected Results:**
- ✅ Third node appears
- ✅ Red alert DISAPPEARS
- ✅ **Green alert appears**: "Root level weightage is valid (100%)" ✅
- ✅ Summary: Total Elements: 3, Root Weightage: 100.00%

---

## 🎯 Test Scenario 3: Create Child Elements

### Test 3.1: Add Children to First Root

**Steps:**
1. Find "1. Engineering & Design" node
2. Click the **Plus icon** (Add child)
3. Dialog opens with title: "Add Child WBS"
4. Notice: Code is auto-suggested as "1.1"
5. Fill form:
   ```
   WBS Code: 1.1 (suggested)
   WBS Name: Detail Engineering
   Description: Detailed engineering design
   Weightage: 60
   Order: 0
   ```
6. Click **"Create"**

**Expected Results:**
- ✅ Child node appears **indented** under parent
- ✅ Green background (Level 1)
- ✅ Badge: "1.1"
- ✅ Badge: "L1"
- ✅ Parent shows chevron icon (collapse/expand)
- ✅ Warning on node: "Level 1 total weightage: 60% (should be 100%)"

### Test 3.2: Complete Children Level

**Steps:**
1. Click Plus icon on "1. Engineering & Design" again
2. Fill:
   ```
   WBS Code: 1.2
   WBS Name: FEED Studies
   Weightage: 40
   Order: 1
   ```
3. Create

**Expected Results:**
- ✅ Second child appears
- ✅ Warning DISAPPEARS (60% + 40% = 100%)
- ✅ Both children visible

### Test 3.3: Add Grandchild (Level 2)

**Steps:**
1. Click Plus on "1.1 Detail Engineering"
2. Notice code suggests "1.1.1"
3. Fill:
   ```
   WBS Code: 1.1.1
   WBS Name: Piping Design
   Description: Piping and pipeline design
   Weightage: 30
   Order: 0
   ```
4. Create

**Expected Results:**
- ✅ Grandchild appears **double indented**
- ✅ Yellow background (Level 2)
- ✅ Badge: "1.1.1"
- ✅ Badge: "L2"
- ✅ Parent "1.1" now has chevron icon

### Test 3.4: Complete Grandchildren

Add two more grandchildren:
```
1.1.2 Structural Design (40%)
1.1.3 Electrical Design (30%)
```

**Expected Result:**
- ✅ Total 100% at level 2
- ✅ No warning on "1.1 Detail Engineering"

---

## 🎯 Test Scenario 4: Collapse/Expand Tree

### Steps:
1. Find "1. Engineering & Design" (has children)
2. Click **chevron icon** (down arrow)
3. Click again

**Expected Results:**
- ✅ First click: Children hide (chevron changes to right arrow)
- ✅ Second click: Children show again (chevron changes to down arrow)
- ✅ Smooth transition

### Test Multi-Level Collapse:
1. Collapse "1.1 Detail Engineering"
2. Grandchildren (1.1.1, 1.1.2, 1.1.3) hide
3. Expand again - grandchildren show

---

## 🎯 Test Scenario 5: Edit WBS Element

### Test 5.1: Edit Name and Description

**Steps:**
1. Find "1.1.1 Piping Design"
2. Click **Edit icon** (pencil)
3. Dialog opens with current values
4. Change:
   ```
   WBS Name: Piping & Pipeline Design (add "& Pipeline")
   Description: Detailed piping, pipeline and layout design
   ```
5. Click **"Update"**

**Expected Results:**
- ✅ Success toast: "WBS element updated successfully"
- ✅ Node updates with new name
- ✅ Changes visible immediately

### Test 5.2: Edit Weightage (Break Validation)

**Steps:**
1. Edit "1.1.1 Piping & Pipeline Design"
2. Change weightage from 30 to 50
3. Update

**Expected Results:**
- ✅ Node updates
- ✅ **Warning appears** on parent: "Level 2 total weightage: 120% (should be 100%)"
- ✅ Shows 30→50 means 50+40+30 = 120%

### Test 5.3: Fix Validation

**Steps:**
1. Edit "1.1.2 Structural Design"
2. Change weightage from 40 to 20
3. Update

**Expected Results:**
- ✅ Warning disappears
- ✅ Total now: 50+20+30 = 100% ✅

---

## 🎯 Test Scenario 6: Delete WBS Elements

### Test 6.1: Delete Leaf Node (No Children)

**Steps:**
1. Find "1.1.3 Electrical Design"
2. Click **Delete icon** (trash)
3. Confirmation dialog appears
4. Click **OK**

**Expected Results:**
- ✅ Confirmation: "Are you sure you want to delete..."
- ✅ Success toast: "Deleted WBS element and 0 child elements"
- ✅ Node disappears from tree
- ✅ Total elements count decreases
- ✅ **Warning appears** on parent (now only 70%)

### Test 6.2: Delete Node with Children (Cascade Delete)

**Steps:**
1. Find "1.1 Detail Engineering" (has 2 children now)
2. Click Delete icon
3. Confirmation: "This will also delete all child elements."
4. Click OK

**Expected Results:**
- ✅ Confirmation mentions deleting children
- ✅ Success toast: "Deleted WBS element and 2 child elements"
- ✅ Parent node AND both children disappear
- ✅ Total elements decreases by 3
- ✅ Only "1.2 FEED Studies" remains under Engineering

### Test 6.3: Delete Root with Full Hierarchy

**Steps:**
1. Make sure "1. Engineering & Design" has children
2. Click Delete on root "1. Engineering & Design"
3. Confirm

**Expected Results:**
- ✅ Entire branch disappears
- ✅ All descendants deleted
- ✅ Toast shows total deleted count

---

## 🎯 Test Scenario 7: Complex Hierarchy

### Goal: Create realistic project WBS

Create this complete structure:

```
1. Engineering & Design (30%)
   1.1 FEED Studies (20%)
   1.2 Detail Engineering (80%)
       1.2.1 Process Design (25%)
       1.2.2 Mechanical Design (25%)
       1.2.3 Piping Design (20%)
       1.2.4 Electrical Design (15%)
       1.2.5 Instrumentation (15%)

2. Procurement (20%)
   2.1 Equipment Procurement (60%)
       2.1.1 Rotating Equipment (40%)
       2.1.2 Static Equipment (30%)
       2.1.3 Packages (30%)
   2.2 Material Procurement (40%)
       2.2.1 Piping Materials (50%)
       2.2.2 Electrical Materials (30%)
       2.2.3 Instrumentation (20%)

3. Construction (50%)
   3.1 Site Preparation (10%)
   3.2 Civil Works (15%)
   3.3 Mechanical Installation (35%)
   3.4 Electrical Installation (20%)
   3.5 Commissioning (20%)
```

**Expected Results:**
- ✅ All nodes created successfully
- ✅ Proper parent-child relationships
- ✅ All levels validate to 100%
- ✅ Green validation at root level
- ✅ Tree displays cleanly with proper indentation
- ✅ Colors cycle: Blue → Green → Yellow → Purple
- ✅ Summary shows correct counts

---

## 🎯 Test Scenario 8: Edge Cases

### Test 8.1: Invalid Weightage

**Steps:**
1. Try to create WBS with weightage = -10
2. Try weightage = 150

**Expected Results:**
- ✅ Form validation prevents negative numbers
- ✅ Form validation prevents > 100

### Test 8.2: Empty Required Fields

**Steps:**
1. Open Add WBS dialog
2. Clear the Code field
3. Try to submit

**Expected Results:**
- ✅ Error: "WBS code is required"
- ✅ Cannot submit

### Test 8.3: Invalid Code Format

**Steps:**
1. Try code: "abc" (lowercase)
2. Try code: "1.1.1!" (special char)

**Expected Results:**
- ✅ Validation error: "must contain only uppercase..."
- ✅ Cannot submit

### Test 8.4: Long Names

**Steps:**
1. Enter 150 character name
2. Try to submit

**Expected Results:**
- ✅ Error: "must not exceed 100 characters"

---

## 🎯 Test Scenario 9: Page Interactions

### Test 9.1: Breadcrumb Navigation

**Steps:**
1. Click "Projects" in breadcrumb
2. Should go back to projects list

### Test 9.2: Back Button

**Steps:**
1. Click "Back" button with arrow
2. Should go to previous page

### Test 9.3: Refresh Page

**Steps:**
1. Create some WBS elements
2. Press F5 to refresh
3. Data should persist

**Expected Results:**
- ✅ All WBS elements still visible after refresh
- ✅ Tree structure maintained
- ✅ Validation states correct

---

## 📊 Test Results Summary

### Test Completion Checklist:

**Navigation & UI:**
- [ ] Navigation from projects works
- [ ] Empty state displays correctly
- [ ] Loading state shows spinner
- [ ] Breadcrumbs work

**CRUD Operations:**
- [ ] Create root WBS works
- [ ] Create child WBS works
- [ ] Edit WBS works
- [ ] Delete WBS works
- [ ] Cascade delete works

**Validation:**
- [ ] Weightage validation works
- [ ] Visual alerts display correctly
- [ ] Per-level validation works
- [ ] Form validation works

**Tree Display:**
- [ ] Hierarchy displays correctly
- [ ] Indentation proper
- [ ] Colors cycle by level
- [ ] Collapse/expand works

**Data Integrity:**
- [ ] Parent-child relationships correct
- [ ] Data persists after refresh
- [ ] Auto-generated codes correct
- [ ] Order maintained

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load WBS structure"
**Solution**: Check if project exists, backend running, token valid

### Issue 2: Dialog doesn't open
**Solution**: Check browser console for React errors

### Issue 3: Weightage doesn't add up
**Solution**: Check if all siblings have correct parentId

### Issue 4: Delete doesn't work
**Solution**: Check for foreign key constraints in backend

### Issue 5: Colors look wrong
**Solution**: Check Tailwind CSS classes loaded

---

## ✅ Sign Off

After completing all tests:

**Tester Name**: _________________  
**Date**: _________________  
**Overall Status**: [ ] PASS [ ] FAIL  

**Critical Bugs Found**: _________________  
**Minor Issues**: _________________  
**Suggestions**: _________________

---

**Test Status**: Ready to Begin 🚀
