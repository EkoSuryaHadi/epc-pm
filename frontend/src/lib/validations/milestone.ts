import { z } from 'zod';

// Milestone validation schema
export const milestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required'),
  description: z.string().optional(),
  targetDate: z.date({
    required_error: 'Target date is required',
  }),
  actualDate: z.date().optional().nullable(),
  status: z.enum(['Pending', 'Achieved', 'Delayed'], {
    required_error: 'Status is required',
  }),
  critical: z.boolean().default(false),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;

// Milestone type with DB fields
export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  targetDate: string;
  actualDate: string | null;
  status: 'Pending' | 'Achieved' | 'Delayed';
  critical: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper to determine status based on dates
export function getMilestoneStatus(
  targetDate: Date,
  actualDate: Date | null
): 'Pending' | 'Achieved' | 'Delayed' {
  if (actualDate) return 'Achieved';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  if (target < today) return 'Delayed';
  return 'Pending';
}

// Helper to get status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Achieved':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-amber-100 text-amber-800';
    case 'Delayed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
