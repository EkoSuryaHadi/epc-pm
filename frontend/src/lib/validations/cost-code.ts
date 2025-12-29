import { z } from 'zod';

// Cost code validation schema
export const costCodeSchema = z.object({
  code: z.string().min(1, 'Cost code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(
    ['MATERIAL', 'LABOR', 'EQUIPMENT', 'SUBCONTRACT', 'OVERHEAD', 'OTHER'],
    {
      required_error: 'Category is required',
    }
  ),
  budget: z.coerce.number().min(0, 'Budget must be positive'),
  wbsId: z.string().optional().nullable(),
});

export type CostCodeFormData = z.infer<typeof costCodeSchema>;

// Cost code type with DB fields
export interface CostCode {
  id: string;
  projectId: string;
  wbsId: string | null;
  code: string;
  name: string;
  description: string | null;
  category: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
  wbs?: {
    id: string;
    code: string;
    name: string;
  } | null;
  _count?: {
    costEntries: number;
  };
}

// Category options with colors
export const COST_CATEGORIES = [
  { value: 'MATERIAL', label: 'Material', color: 'blue' },
  { value: 'LABOR', label: 'Labor', color: 'green' },
  { value: 'EQUIPMENT', label: 'Equipment', color: 'orange' },
  { value: 'SUBCONTRACT', label: 'Subcontract', color: 'purple' },
  { value: 'OVERHEAD', label: 'Overhead', color: 'gray' },
  { value: 'OTHER', label: 'Other', color: 'slate' },
] as const;

// Helper to get category display info
export function getCategoryInfo(category: string) {
  return COST_CATEGORIES.find(c => c.value === category) || COST_CATEGORIES[5];
}
