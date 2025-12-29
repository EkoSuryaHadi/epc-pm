-- =====================================================
-- FIX WBS STRUCTURE - 200% WEIGHTAGE ISSUE
-- =====================================================
-- Run this script in Prisma Studio or pgAdmin
-- IMPORTANT: Replace 'YOUR_PROJECT_ID' with actual project ID

-- Step 1: Check current structure
-- =====================================================
SELECT 
    code,
    name,
    "parentId",
    level,
    weightage,
    "order"
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
ORDER BY code;

-- Step 2: Identify nodes with NULL parentId (should be root level only)
-- =====================================================
SELECT 
    code,
    name,
    level,
    weightage
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
AND "parentId" IS NULL;
-- Expected: Only codes '1', '2', '3' should appear

-- Step 3: Fix Parent-Child Relationships
-- =====================================================

-- Fix "2.2 Material Procurement" - should be child of "2"
UPDATE wbs 
SET "parentId" = (SELECT id FROM wbs WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID'),
    level = 1
WHERE code = '2.2' 
AND "projectId" = 'YOUR_PROJECT_ID'
AND name = 'Material Procurement';

-- Fix "2.1.1 Rotating Equipment" - should be child of "2" or "2.1"
-- Option A: Make it direct child of "2" (if no "2.1" exists)
UPDATE wbs 
SET "parentId" = (SELECT id FROM wbs WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID'),
    level = 1,
    code = '2.1'  -- Change code to 2.1 if no intermediate level needed
WHERE code = '2.1.1' 
AND "projectId" = 'YOUR_PROJECT_ID'
AND name = 'Rotating Equipment';

-- Fix children of "2.2" (Piping, Electrical, Instrumentation, Static)
UPDATE wbs 
SET "parentId" = (SELECT id FROM wbs WHERE code = '2.2' AND "projectId" = 'YOUR_PROJECT_ID'),
    level = 2
WHERE code IN ('2.2.1', '2.2.2', '2.2.3', '2.2.4')
AND "projectId" = 'YOUR_PROJECT_ID'
AND name IN ('Piping Materials', 'Electrical Materials', 'Instrumentation', 'Static Equipment');

-- Step 4: Fix Duplicate Code (2.2.3 used twice)
-- =====================================================
-- Change "Packages" from 2.2.3 to 2.3
UPDATE wbs 
SET code = '2.3',
    level = 1,
    "parentId" = (SELECT id FROM wbs WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID')
WHERE code = '2.2.3' 
AND name = 'Packages' 
AND "projectId" = 'YOUR_PROJECT_ID';

-- Step 5: Fix Order Field (for correct sorting)
-- =====================================================

-- Root level order
UPDATE wbs SET "order" = 1 WHERE code = '1' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 2 WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 3 WHERE code = '3' AND "projectId" = 'YOUR_PROJECT_ID';

-- Children of "2" (Procurement) order
UPDATE wbs SET "order" = 1 WHERE code = '2.1' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 2 WHERE code = '2.2' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 3 WHERE code = '2.3' AND "projectId" = 'YOUR_PROJECT_ID';

-- Children of "2.2" (Material Procurement) order
UPDATE wbs SET "order" = 1 WHERE code = '2.2.1' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 2 WHERE code = '2.2.2' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 3 WHERE code = '2.2.3' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 4 WHERE code = '2.2.4' AND "projectId" = 'YOUR_PROJECT_ID';

-- Step 6: Fix Weightage (Root Level MUST = 100%)
-- =====================================================
-- Current: Engineering (30%) + Procurement (25%) + Construction (55%) = 110%

-- Option A: Proportional adjustment to 100%
UPDATE wbs SET weightage = 27.27 WHERE code = '1' AND "projectId" = 'YOUR_PROJECT_ID'; -- Engineering
UPDATE wbs SET weightage = 22.73 WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID'; -- Procurement
UPDATE wbs SET weightage = 50.00 WHERE code = '3' AND "projectId" = 'YOUR_PROJECT_ID'; -- Construction

-- Option B: Manual adjustment (uncomment if preferred)
-- UPDATE wbs SET weightage = 25 WHERE code = '1' AND "projectId" = 'YOUR_PROJECT_ID'; -- Engineering
-- UPDATE wbs SET weightage = 30 WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID'; -- Procurement
-- UPDATE wbs SET weightage = 45 WHERE code = '3' AND "projectId" = 'YOUR_PROJECT_ID'; -- Construction

-- Fix children of "2.2" (Material Procurement) - Total should = 100%
-- Current: 30 + 30 + 30 + 30 = 120%
-- Fixed: Each should be 25%
UPDATE wbs SET weightage = 25 WHERE code = '2.2.1' AND "projectId" = 'YOUR_PROJECT_ID'; -- Piping
UPDATE wbs SET weightage = 25 WHERE code = '2.2.2' AND "projectId" = 'YOUR_PROJECT_ID'; -- Electrical
UPDATE wbs SET weightage = 25 WHERE code = '2.2.3' AND "projectId" = 'YOUR_PROJECT_ID'; -- Instrumentation
UPDATE wbs SET weightage = 25 WHERE code = '2.2.4' AND "projectId" = 'YOUR_PROJECT_ID'; -- Static

-- Step 7: Verification Queries
-- =====================================================

-- Check root level weightage (MUST = 100%)
SELECT 
    'Root Level' as level_name,
    SUM(weightage) as total_weightage,
    CASE 
        WHEN ABS(SUM(weightage) - 100) < 0.01 THEN '✓ VALID'
        ELSE '✗ INVALID - Must be 100%'
    END as validation
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
AND "parentId" IS NULL;

-- Check children of Procurement (code '2')
SELECT 
    'Children of Procurement' as level_name,
    SUM(weightage) as total_weightage,
    CASE 
        WHEN ABS(SUM(weightage) - 100) < 0.01 THEN '✓ VALID'
        ELSE '✗ INVALID - Must be 100%'
    END as validation
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
AND "parentId" = (SELECT id FROM wbs WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID');

-- Check children of Material Procurement (code '2.2')
SELECT 
    'Children of Material Procurement' as level_name,
    SUM(weightage) as total_weightage,
    CASE 
        WHEN ABS(SUM(weightage) - 100) < 0.01 THEN '✓ VALID'
        ELSE '✗ INVALID - Must be 100%'
    END as validation
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
AND "parentId" = (SELECT id FROM wbs WHERE code = '2.2' AND "projectId" = 'YOUR_PROJECT_ID');

-- Final structure view
SELECT 
    code,
    name,
    level,
    weightage,
    "order",
    CASE WHEN "parentId" IS NULL THEN 'ROOT' ELSE 'CHILD' END as node_type
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
ORDER BY code;

-- Check for duplicate codes (should return 0 rows)
SELECT 
    code,
    COUNT(*) as count
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
GROUP BY code
HAVING COUNT(*) > 1;
