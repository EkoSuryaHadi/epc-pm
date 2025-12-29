import { z } from 'zod';

// Entry type options
export const ENTRY_TYPES = [
  { value: 'BUDGET', label: 'Budget', color: 'blue' },
  { value: 'ACTUAL', label: 'Actual', color: 'green' },
  { value: 'FORECAST', label: 'Forecast', color: 'purple' },
  { value: 'COMMITMENT', label: 'Commitment', color: 'orange' },
] as const;

// Cost entry validation schema
export const costEntrySchema = z.object({
  costCodeId: z.string().min(1, 'Cost code is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  entryDate: z.date({
    required_error: 'Entry date is required',
  }),
  entryType: z.enum(['BUDGET', 'ACTUAL', 'FORECAST', 'COMMITMENT'], {
    required_error: 'Entry type is required',
  }),
  reference: z.string().optional(),
});

export type CostEntryFormData = z.infer<typeof costEntrySchema>;

// Cost entry type with DB fields
export interface CostEntry {
  id: string;
  projectId: string;
  costCodeId: string;
  description: string;
  amount: number;
  entryDate: string;
  entryType: string;
  reference: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  costCode?: {
    id: string;
    code: string;
    name: string;
    category: string;
    budget: number;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

// Batch entry row schema (for multiple entries at once)
export const batchEntryRowSchema = z.object({
  costCodeId: z.string().min(1, 'Cost code is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  entryType: z.enum(['BUDGET', 'ACTUAL', 'FORECAST', 'COMMITMENT']),
  reference: z.string().optional(),
});

export const batchEntrySchema = z.object({
  entryDate: z.date({
    required_error: 'Entry date is required',
  }),
  entries: z.array(batchEntryRowSchema).min(1, 'At least one entry is required'),
});

export type BatchEntryFormData = z.infer<typeof batchEntrySchema>;
export type BatchEntryRow = z.infer<typeof batchEntryRowSchema>;

// Helper to get entry type display info
export function getEntryTypeInfo(entryType: string) {
  return ENTRY_TYPES.find(t => t.value === entryType) || ENTRY_TYPES[0];
}
