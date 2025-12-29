# Phase 5: Document Management - Implementation Plan

**Estimated Time:** 6-8 hours  
**Priority:** High ⭐⭐⭐⭐  
**Status:** Ready to implement  
**Date:** October 29, 2025

---

## 📋 Overview

Implement a comprehensive document management system with file upload, version control, search, filtering, and commenting capabilities.

---

## 🎯 Objectives

1. **Document Upload** - Drag-drop file upload with metadata
2. **Document Register** - Searchable table with filtering
3. **Version Control** - Track document revisions
4. **Document Viewer** - View and download documents
5. **Comment System** - Add comments and discussions
6. **Search & Filter** - Find documents quickly
7. **Access Control** - Role-based permissions

---

## 🏗️ Technical Architecture

### Backend (Already exists - needs enhancement)

**Existing:**
- ✅ Document model in Prisma schema
- ✅ Basic CRUD endpoints
- ✅ Comment system
- ✅ Filtering by category/status/discipline

**Needs Implementation:**
- ⏳ File upload endpoint with Multer
- ⏳ File storage (local or S3)
- ⏳ File download endpoint
- ⏳ Revision/version tracking
- ⏳ Document approval workflow

### Frontend (Needs implementation)

**Components to Create:**
1. DocumentUploadForm - File upload with drag-drop
2. DocumentTable - Document list with actions
3. DocumentDetails - View document details
4. DocumentViewer - Preview documents
5. DocumentComments - Comment section
6. DocumentFilters - Advanced filters

**Pages to Create:**
1. `/documents` - Document register page
2. `/documents/[id]` - Document details page
3. `/documents/upload` - Upload document page

---

## 📊 Data Model

### Document Model (Existing)
```prisma
model Document {
  id            String         @id @default(uuid())
  projectId     String
  documentNo    String         // e.g., "ENG-DWG-001"
  title         String
  description   String?
  category      String         // Drawing, Spec, Report, etc.
  discipline    String?        // Civil, Electrical, etc.
  revision      String         @default("A")
  status        DocumentStatus @default(DRAFT)
  filePath      String         // Path to file
  fileSize      Int            // Size in bytes
  mimeType      String         // application/pdf, etc.
  uploadedById  String
  uploadedAt    DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  project    Project   @relation(...)
  uploadedBy User      @relation(...)
  comments   Comment[]
}

enum DocumentStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  SUPERSEDED
  VOID
}
```

---

## 🎨 UI/UX Design

### Documents Page Layout
```
┌──────────────────────────────────────────────────┐
│ Header: Documents                                │
│ [Upload Document Button]                         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Filters:                                         │
│ [Search] [Category ▼] [Status ▼] [Discipline ▼] │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Document Table:                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ Doc No | Title | Category | Status | Rev |... │ │
│ │ ENG-001| Spec  | Spec     | Draft  | A   |... │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Upload Dialog
```
┌──────────────────────────────────────────────┐
│ Upload Document                              │
├──────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐   │
│ │   Drag & Drop Files Here               │   │
│ │   or Click to Browse                   │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ Document Number: [                    ]      │
│ Title: [                              ]      │
│ Category: [Select ▼]                         │
│ Discipline: [Select ▼]                       │
│ Description: [                        ]      │
│ Revision: [A]                                │
│                                              │
│ [Cancel] [Upload]                            │
└──────────────────────────────────────────────┘
```

---

## 🔧 Implementation Tasks

### Task 1: Backend File Upload (2 hours)

#### 1.1 Install Dependencies
```bash
npm install --save multer @types/multer
npm install --save uuid mime-types
```

#### 1.2 Create File Upload Endpoint
**File:** `backend/src/documents/documents.controller.ts`

```typescript
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  }),
)
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() metadata: any,
  @Request() req,
) {
  return this.documentsService.uploadFile(
    file,
    metadata,
    req.user.id,
  );
}
```

#### 1.3 Add Download Endpoint
```typescript
@Get(':id/download')
async downloadFile(@Param('id') id: string, @Res() res: Response) {
  const document = await this.documentsService.findOne(id);
  res.download(document.filePath, document.title);
}
```

---

### Task 2: Frontend Components (2-3 hours)

#### 2.1 Document Validation Schema
**File:** `frontend/src/lib/validations/document.ts`

```typescript
import { z } from 'zod';

export const documentSchema = z.object({
  documentNo: z.string().min(1, 'Document number required'),
  title: z.string().min(1, 'Title required'),
  category: z.string().min(1, 'Category required'),
  discipline: z.string().optional(),
  description: z.string().optional(),
  revision: z.string().default('A'),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED', 'VOID']),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

export interface Document extends DocumentFormData {
  id: string;
  projectId: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  uploadedAt: Date;
  updatedAt: Date;
}
```

#### 2.2 DocumentUploadForm Component
**File:** `frontend/src/components/documents/DocumentUploadForm.tsx`

Features:
- Drag-and-drop file upload
- File type validation
- File size validation
- Metadata form (document number, title, category, etc.)
- Progress indicator
- Multiple file support

#### 2.3 DocumentTable Component
**File:** `frontend/src/components/documents/DocumentTable.tsx`

Features:
- Sortable columns
- Search by document number/title
- Filter by category/status/discipline
- Row actions (view, download, edit, delete)
- File size formatting
- Status badges
- Pagination

---

### Task 3: Frontend Pages (2 hours)

#### 3.1 Documents Page
**File:** `frontend/src/app/dashboard/projects/[id]/documents/page.tsx`

Features:
- Document list table
- Upload button
- Filters
- Search
- Statistics (total, by status)

#### 3.2 Document Details Page
**File:** `frontend/src/app/dashboard/projects/[id]/documents/[documentId]/page.tsx`

Features:
- Document metadata display
- Download button
- Comments section
- Version history
- Edit button

---

### Task 4: API Client Integration (30 min)

**File:** `frontend/src/lib/api-client.ts`

```typescript
documents: {
  getAll: (projectId: string, filters?: any) => 
    client.get(`/documents?projectId=${projectId}`, { params: filters }),
  getById: (id: string) => 
    client.get(`/documents/${id}`),
  upload: (projectId: string, file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    return client.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, data: any) => 
    client.patch(`/documents/${id}`, data),
  delete: (id: string) => 
    client.delete(`/documents/${id}`),
  download: (id: string) => 
    client.get(`/documents/${id}/download`, { responseType: 'blob' }),
  addComment: (id: string, content: string) => 
    client.post(`/documents/${id}/comments`, { content }),
},
```

---

## 📝 Document Categories

```typescript
const DOCUMENT_CATEGORIES = [
  'Drawing',
  'Specification',
  'Report',
  'Procedure',
  'Manual',
  'Datasheet',
  'Calculation',
  'Correspondence',
  'Other',
];

const DOCUMENT_DISCIPLINES = [
  'Civil',
  'Structural',
  'Mechanical',
  'Electrical',
  'Instrumentation',
  'Piping',
  'Process',
  'HVAC',
  'Other',
];
```

---

## 🔒 Security Considerations

1. **File Upload:**
   - Validate file type (whitelist)
   - Limit file size
   - Scan for viruses (optional)
   - Sanitize filenames

2. **Access Control:**
   - Check user has project access
   - Role-based permissions
   - Audit trail

3. **Storage:**
   - Secure file storage location
   - Prevent directory traversal
   - Use unique filenames

---

## 🧪 Testing Checklist

### Backend:
- [ ] File upload works
- [ ] File download works
- [ ] Large files handled
- [ ] File type validation
- [ ] Error handling

### Frontend:
- [ ] Drag-drop upload works
- [ ] Form validation works
- [ ] Table displays correctly
- [ ] Search and filters work
- [ ] Download triggers correctly
- [ ] Comments system works

### Integration:
- [ ] End-to-end upload flow
- [ ] Files persist correctly
- [ ] Metadata saved accurately
- [ ] Real-time updates

---

## 📊 Success Criteria

Phase 5 complete when:
- ✅ Documents can be uploaded via drag-drop
- ✅ Document table displays all documents
- ✅ Search and filters work
- ✅ Documents can be downloaded
- ✅ Comments can be added
- ✅ Status can be updated
- ✅ All validations work
- ✅ No console errors

---

## 💡 Optional Enhancements (Future)

- Document versioning (track revisions)
- Approval workflow with signatures
- Document preview (PDF, images)
- Batch upload
- Export to ZIP
- Advanced search
- Document templates
- OCR for scanned documents
- Integration with external systems

---

## 🚀 Estimated Timeline

**Total: 6-8 hours**

- Backend file upload: 2 hours
- Frontend components: 2-3 hours
- Frontend pages: 2 hours
- Testing & polish: 1-2 hours

---

**Ready to implement Phase 5!** 🎯

---

**Created:** October 29, 2025  
**Status:** Planning Complete - Ready for Implementation
