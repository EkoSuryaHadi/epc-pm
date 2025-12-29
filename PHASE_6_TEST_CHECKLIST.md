# ✅ Phase 6 Testing Checklist - Quick Reference

**Date:** October 29, 2025  
**Phase:** Risk Management  
**Duration:** 15-20 minutes

---

## 🚀 Quick Start

### 1. Start Servers (if not running):
```bash
# Terminal 1 - Backend
cd E:\Project\epc\backend
npm run start:dev

# Terminal 2 - Frontend
cd E:\Project\epc\frontend
npm run dev
```

### 2. Access Application:
- URL: http://localhost:3000
- Login: admin@epc.com / admin123
- Navigate to any project
- Click "Risks" button

---

## ✅ Essential Tests (Must Pass)

### 1. Risk Register Page ✅
- [ ] Page loads without errors
- [ ] 5 statistics cards display
- [ ] "Add Risk" button visible
- [ ] "Risk Matrix" button visible
- [ ] Risk table renders

### 2. Create Risk ✅
- [ ] Click "Add Risk" opens dialog
- [ ] Title field validates (required)
- [ ] Description field validates (required)
- [ ] Category dropdown has 10 options
- [ ] Owner field validates (required)
- [ ] Probability dropdown: 1-5 with descriptions
- [ ] Impact dropdown: 1-5 with descriptions
- [ ] **Risk score calculates automatically** ⭐
- [ ] Score display: "P × I = Score"
- [ ] Risk level badge shows correct color
- [ ] Alert appears if score ≥15
- [ ] Form submits successfully
- [ ] Success toast: "Risk created successfully"
- [ ] Risk appears in table

**Test Data:**
```
Title: "Equipment Delivery Delay"
Description: "Main equipment may arrive late from supplier"
Category: "Schedule"
Owner: "Procurement Manager"
Probability: 4 (High - 50-70%)
Impact: 4 (Major)
Expected Score: 16 (High Risk - Orange badge + alert)
Status: "Identified"
Mitigation: "Identify alternative suppliers, expedite shipping"
```

### 3. Risk Table Display ✅
- [ ] Risk appears in table
- [ ] Risk score badge: **16** (Orange)
- [ ] Alert icon visible (score ≥15)
- [ ] Probability shows: **4**
- [ ] Impact shows: **4**
- [ ] Status badge: "Identified" (Gray)
- [ ] Category: "Schedule"
- [ ] Owner: "Procurement Manager"
- [ ] Created date displays
- [ ] Edit and Delete buttons visible

### 4. Risk Score Validation ✅
Create multiple risks to test score calculation:

**Test Case A: Very Low Risk**
- Probability: 1, Impact: 2
- Expected Score: **2** (Green badge)

**Test Case B: Low Risk**
- Probability: 2, Impact: 3  
- Expected Score: **6** (Blue badge)

**Test Case C: Medium Risk**
- Probability: 3, Impact: 4
- Expected Score: **12** (Yellow badge)

**Test Case D: High Risk**
- Probability: 4, Impact: 4
- Expected Score: **16** (Orange badge + alert)

**Test Case E: Extreme Risk**
- Probability: 5, Impact: 5
- Expected Score: **25** (Red badge + alert)

**Verify:**
- [ ] All scores calculated correctly
- [ ] Badges show correct colors
- [ ] Alerts appear for scores ≥15
- [ ] Table sorts by score (highest first)

### 5. Risk Matrix ✅
- [ ] Click "Risk Matrix" button
- [ ] Matrix page loads
- [ ] 5×5 grid displays
- [ ] Cell colors match legend:
  - Bottom-left: Green
  - Top-right: Red
  - Gradient visible
- [ ] Cells show risk counts
- [ ] Hover shows tooltip with risk titles
- [ ] Legend displays 5 risk levels
- [ ] Summary cards show correct counts
- [ ] Instructions card helpful
- [ ] Back button works

### 6. Search and Filter ✅
**Search:**
- [ ] Type "Equipment" → Shows matching risks only
- [ ] Clear search → Shows all risks
- [ ] Search is case-insensitive
- [ ] Searches title, description, AND category

**Filter:**
- [ ] Status dropdown shows all options
- [ ] Select "Mitigating" → Shows only mitigating risks
- [ ] Select "All Statuses" → Shows all
- [ ] Search + Filter work together

### 7. Edit Risk ✅
- [ ] Click Edit icon
- [ ] Form pre-fills with current data
- [ ] Dialog title: "Edit Risk"
- [ ] Change probability to 5
- [ ] Risk score updates in real-time
- [ ] Change status to "Mitigating"
- [ ] Click "Update Risk"
- [ ] Success toast appears
- [ ] Table updates immediately
- [ ] Risk resorts if score changed

### 8. Delete Risk ✅
- [ ] Click Delete icon
- [ ] Confirmation dialog appears
- [ ] Message: "This action cannot be undone"
- [ ] Click "Cancel" → Dialog closes, risk NOT deleted
- [ ] Click Delete icon again
- [ ] Click "Delete" → Risk deleted
- [ ] Success toast appears
- [ ] Table updates
- [ ] Statistics decrease

### 9. Change Orders ✅
**Note:** Access via URL: http://localhost:3000/dashboard/projects/[YOUR_PROJECT_ID]/change-orders

- [ ] Page loads
- [ ] 4 summary cards display
- [ ] Click "Create Change Order"
- [ ] Form opens with all fields
- [ ] Create change order:
  ```
  Title: "Add Fire Protection System"
  Description: "Client requests additional fire safety"
  Type: "Scope Change" (📋 icon)
  Cost Impact: 75000
  Time Impact: 20
  Requested By: "Client Representative"
  Status: "Pending Review"
  ```
- [ ] Impact summary shows:
  - "$75,000 increase" (red)
  - "20 days delay" (orange)
- [ ] Submit successful
- [ ] Change order in table
- [ ] Summary cards update:
  - Total: +1
  - Pending: +1
  - Cost Impact: +$75,000
  - Time Impact: +20 days

### 10. Navigation ✅
- [ ] "Risks" button on project card
- [ ] Click navigates to risk register
- [ ] "Risk Matrix" button navigates
- [ ] "Back to Risks" button works
- [ ] Browser back button works
- [ ] All pages preserve data

---

## 🎯 Critical Tests (Must All Pass)

### Core Functionality:
1. ✅ Risk score calculation accurate
2. ✅ Risk matrix colors correct
3. ✅ CRUD operations work
4. ✅ Search and filter functional
5. ✅ Change order impacts calculate
6. ✅ Navigation works
7. ✅ No console errors
8. ✅ No crashes

### Data Integrity:
1. ✅ Statistics accurate
2. ✅ Sorting correct
3. ✅ Filters work
4. ✅ Updates persist
5. ✅ Deletes remove data

---

## 🐛 Known Limitations

**Phase 6 MVP excludes:**
- Risk dependencies/relationships
- Risk history/audit trail
- Automated notifications
- Risk reports export
- Monte Carlo simulation
- Integration with schedule/cost modules

**These are optional enhancements for future phases.**

---

## 📝 Testing Notes

**Space for your notes:**

Risk Register:
- 
-

Risk Matrix:
-
-

Change Orders:
-
-

Issues Found:
-
-

---

## ✅ Final Verdict

**Phase 6 Status:** [ ] Pass [ ] Needs Work  

**Ready for Phase 7:** [ ] Yes [ ] No  

**Comments:**

---

**Testing Guide Created:** October 29, 2025  
**For detailed test cases, see:** PHASE_6_TESTING_GUIDE.md
