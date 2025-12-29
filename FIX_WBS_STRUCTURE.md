# Perbaikan WBS Structure - 200% Issue

## Masalah yang Ditemukan

### 1. Total Weightage = 200% (Harusnya 100%)
**Penyebab**: Node dengan parentId = null yang seharusnya child node

### 2. Urutan Salah
- Item "2.1.1" muncul sebelum "2"
- Kode duplikat "2.2.3" (Instrumentation & Packages)

### 3. Struktur Hierarchy Salah
Beberapa node tidak memiliki parentId yang benar

---

## Langkah Perbaikan

### Step 1: Cek Data di Database
```sql
-- Lihat semua WBS untuk project ini
SELECT id, code, name, "parentId", level, weightage, "order"
FROM wbs
WHERE "projectId" = 'YOUR_PROJECT_ID'
ORDER BY code;
```

### Step 2: Identifikasi Node dengan parentId Salah
Node yang HARUS punya parent tapi parentId = null:
- `2.1.1 Rotating Equipment` → parent seharusnya node dengan code "2.1" atau "2"
- `2.2 Material Procurement` → parent seharusnya node dengan code "2"
- `2.2.1, 2.2.2, 2.2.3, 2.2.4` → parent seharusnya node dengan code "2.2"
- `2.2.3 Packages` (duplikat) → ganti code jadi "2.3" atau "3.1"

### Step 3: Fix ParentId
```sql
-- Update parentId untuk "2.2 Material Procurement"
UPDATE wbs 
SET "parentId" = (SELECT id FROM wbs WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID')
WHERE code = '2.2' AND "projectId" = 'YOUR_PROJECT_ID';

-- Update parentId untuk "2.2.1", "2.2.2", "2.2.3", "2.2.4"
UPDATE wbs 
SET "parentId" = (SELECT id FROM wbs WHERE code = '2.2' AND "projectId" = 'YOUR_PROJECT_ID')
WHERE code IN ('2.2.1', '2.2.2', '2.2.3', '2.2.4') 
AND "projectId" = 'YOUR_PROJECT_ID';
```

### Step 4: Fix Duplicate Code "2.2.3"
```sql
-- Ganti kode Packages dari "2.2.3" menjadi "2.3"
UPDATE wbs 
SET code = '2.3', level = 1
WHERE code = '2.2.3' 
AND name = 'Packages' 
AND "projectId" = 'YOUR_PROJECT_ID';
```

### Step 5: Fix Order Field
```sql
-- Set order yang benar untuk root level
UPDATE wbs SET "order" = 1 WHERE code = '1' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 2 WHERE code = '2' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 3 WHERE code = '3' AND "projectId" = 'YOUR_PROJECT_ID';

-- Set order untuk children of "2" (Procurement)
UPDATE wbs SET "order" = 1 WHERE code = '2.1' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 2 WHERE code = '2.2' AND "projectId" = 'YOUR_PROJECT_ID';
UPDATE wbs SET "order" = 3 WHERE code = '2.3' AND "projectId" = 'YOUR_PROJECT_ID';
```

### Step 6: Fix Weightage (Root Level harus = 100%)
Saat ini: Engineering (30%) + Procurement (25%) + Construction (55%) = 110%

**Opsi A - Proportional Adjustment:**
```
Engineering & Design: 30/110 × 100 = 27.27%
Procurement: 25/110 × 100 = 22.73%
Construction: 55/110 × 100 = 50.00%
Total = 100% ✓
```

**Opsi B - Manual Adjustment:**
```
Engineering & Design: 25%
Procurement: 30%
Construction: 45%
Total = 100% ✓
```

---

## Struktur yang Benar

```
📁 Project Control System (100%)
├── 1 Engineering & Design (30%)
│   └── 1.1 Design Documents
│
├── 2 Procurement (25%)
│   ├── 2.1 Equipment Procurement
│   │   └── 2.1.1 Rotating Equipment (40% dari 2.1)
│   ├── 2.2 Material Procurement (40% dari 2)
│   │   ├── 2.2.1 Piping Materials (30% dari 2.2)
│   │   ├── 2.2.2 Electrical Materials (30% dari 2.2)
│   │   ├── 2.2.3 Instrumentation (30% dari 2.2)
│   │   └── 2.2.4 Static Equipment (30% dari 2.2)
│   └── 2.3 Packages (60% dari 2)
│
└── 3 Construction (55%)
    └── 3.1 Construction Activities
```

---

## Validasi Weightage Per Level

### Root Level (Level 0): MUST = 100%
- Engineering & Design: 30%
- Procurement: 25%
- Construction: 55%
- **Total: 110%** ❌ → Perlu disesuaikan

### Children of "2" (Procurement): MUST = 100%
- 2.1 Equipment: ?%
- 2.2 Material Procurement: 40%
- 2.3 Packages: 60%
- **Total: 100%** ✓ (jika 2.1 = 0% atau tidak ada)

### Children of "2.2" (Material Procurement): MUST = 100%
- 2.2.1 Piping: 30%
- 2.2.2 Electrical: 30%
- 2.2.3 Instrumentation: 30%
- 2.2.4 Static: 30%
- **Total: 120%** ❌ → Perlu disesuaikan (masing-masing jadi 25%)

---

## Testing After Fix

1. **Refresh halaman WBS**
2. **Cek alert merah hilang** - tidak ada "Root level weightage total is 200%"
3. **Cek urutan benar** - 1, 2, 2.1, 2.2, 2.3, 3
4. **Cek tidak ada duplikat code**
5. **Cek semua child punya parent**

---

## Cara Fix via UI (Alternatif)

1. **Edit setiap node yang salah**
   - Klik icon edit (✏️)
   - Pastikan parentId benar
   - Simpan

2. **Edit weightage root level**
   - Edit "Engineering & Design" → 27%
   - Edit "Procurement" → 23%
   - Edit "Construction" → 50%
   - Total = 100% ✓

3. **Rename Packages**
   - Edit node "Packages"
   - Ganti code dari "2.2.3" → "2.3"
   - Pastikan parent = "2" (Procurement)
