import { z } from 'zod';

// Baseline validation schema
export const baselineSchema = z.object({
  name: z.string().min(1, 'Baseline name is required'),
  description: z.string().optional(),
  setAsActive: z.boolean().default(false),
});

export type BaselineFormData = z.infer<typeof baselineSchema>;

// Baseline type with DB fields
export interface ScheduleBaseline {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  baselineDate: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
  };
}

// Baseline task type
export interface BaselineTask {
  id: string;
  baselineId: string;
  scheduleId: string;
  taskName: string;
  plannedStart: string;
  plannedEnd: string;
  plannedDuration: number;
  plannedProgress: number;
  wbsId: string | null;
  createdAt: string;
}

// Variance report types
export interface VarianceTask {
  taskId: string;
  taskName: string;
  plannedStart: string;
  plannedEnd: string;
  plannedDuration: number;
  actualStart: string | null;
  actualEnd: string | null;
  actualDuration: number | null;
  actualProgress: number | null;
  startVariance: number | null;
  endVariance: number | null;
  durationVariance: number | null;
  status: 'On Track' | 'Minor Delay' | 'Major Delay' | 'Ahead' | 'Task Deleted';
}

export interface VarianceSummary {
  totalTasks: number;
  onTrackCount: number;
  delayedCount: number;
  onTrackPercentage: number;
  delayedPercentage: number;
  avgDelay: number;
}

export interface VarianceReport {
  baseline: {
    id: string;
    name: string;
    baselineDate: string;
  };
  summary: VarianceSummary;
  tasks: VarianceTask[];
}

// Helper to get status color
export function getVarianceStatusColor(status: string): string {
  switch (status) {
    case 'On Track':
      return 'bg-green-100 text-green-800';
    case 'Minor Delay':
      return 'bg-yellow-100 text-yellow-800';
    case 'Major Delay':
      return 'bg-red-100 text-red-800';
    case 'Ahead':
      return 'bg-blue-100 text-blue-800';
    case 'Task Deleted':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper to format variance
export function formatVariance(days: number | null): string {
  if (days === null) return '-';
  if (days === 0) return 'On time';
  if (days > 0) return `+${days} days`;
  return `${days} days`;
}
