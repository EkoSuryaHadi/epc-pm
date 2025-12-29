import { z } from 'zod';

export const documentSchema = z.object({
  documentNo: z.string().min(1, 'Document number is required'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  discipline: z.string().optional(),
  description: z.string().optional(),
  revision: z.string().default('A'),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED', 'VOID']).default('DRAFT'),
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
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    comments: number;
  };
}

export const DOCUMENT_CATEGORIES = [
  'Drawing',
  'Specification',
  'Report',
  'Procedure',
  'Manual',
  'Datasheet',
  'Calculation',
  'Correspondence',
  'Other',
] as const;

export const DOCUMENT_DISCIPLINES = [
  'Civil',
  'Structural',
  'Mechanical',
  'Electrical',
  'Instrumentation',
  'Piping',
  'Process',
  'HVAC',
  'Other',
] as const;

export const DOCUMENT_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'gray' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'blue' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'SUPERSEDED', label: 'Superseded', color: 'yellow' },
  { value: 'VOID', label: 'Void', color: 'red' },
] as const;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
