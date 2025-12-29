import { z } from 'zod';

// Schedule task validation schema
export const scheduleTaskSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  progress: z.coerce.number().min(0).max(100).default(0),
  wbsId: z.string().optional().nullable(),
  predecessors: z.array(z.string()).default([]),
  resources: z.array(z.string()).default([]),
  plannedHours: z.coerce.number().optional().nullable(),
  actualHours: z.coerce.number().optional().nullable(),
  isCritical: z.boolean().default(false),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export type ScheduleTaskFormData = z.infer<typeof scheduleTaskSchema>;

// Schedule task type with DB fields
export interface ScheduleTask {
  id: string;
  projectId: string;
  wbsId: string | null;
  taskName: string;
  description: string | null;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  isCritical: boolean;
  predecessors: string[];
  resources: string[];
  plannedHours: number | null;
  actualHours: number | null;
  createdAt: string;
  updatedAt: string;
  wbs?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

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
  status: string;
  critical: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper to calculate duration in days
export function calculateDuration(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end day
}

// Helper to get task status based on dates and progress
export function getTaskStatus(task: ScheduleTask): 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' {
  if (task.progress === 100) return 'Completed';
  if (task.progress === 0) return 'Not Started';
  
  const today = new Date();
  const endDate = new Date(task.endDate);
  
  if (endDate < today && task.progress < 100) return 'Delayed';
  return 'In Progress';
}
