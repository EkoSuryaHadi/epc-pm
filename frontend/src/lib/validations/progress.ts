import { z } from 'zod';

// Progress Update validation schema
export const progressUpdateSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  wbsId: z.string().uuid('Invalid WBS ID'),
  reportDate: z.date({
    required_error: 'Report date is required',
  }),
  physicalProgress: z
    .number({
      required_error: 'Physical progress is required',
      invalid_type_error: 'Physical progress must be a number',
    })
    .min(0, 'Progress cannot be less than 0%')
    .max(100, 'Progress cannot exceed 100%'),
  plannedProgress: z
    .number({
      required_error: 'Planned progress is required',
      invalid_type_error: 'Planned progress must be a number',
    })
    .min(0, 'Planned progress cannot be less than 0%')
    .max(100, 'Planned progress cannot exceed 100%'),
  manhours: z
    .number({
      invalid_type_error: 'Manhours must be a number',
    })
    .nonnegative('Manhours cannot be negative')
    .optional()
    .nullable(),
  remarks: z.string().optional().nullable(),
});

export type ProgressUpdateFormData = z.infer<typeof progressUpdateSchema>;

// Progress Update interface (from database)
export interface ProgressUpdate {
  id: string;
  projectId: string;
  wbsId: string;
  reportDate: Date | string;
  physicalProgress: number;
  plannedProgress: number;
  manhours: number | null;
  remarks: string | null;
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  wbs?: {
    id: string;
    code: string;
    name: string;
    weightage: number;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

// Progress Summary interface
export interface ProgressSummary {
  overallProgress: number;
  overallPlanned: number;
  variance: number;
  wbsProgress: {
    wbsCode: string;
    wbsName: string;
    weightage: number;
    progress: number;
    planned: number;
  }[];
}

// EVM Metrics interface
export interface EVMMetrics {
  budget: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  costVariance: number;
  scheduleVariance: number;
  cpi: number;
  spi: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  toCompletePerformanceIndex: number;
  actualProgress: number;
  plannedProgress: number;
  progressVariance: number;
  costStatus: string;
  scheduleStatus: string;
}

// KPI Metrics interface
export interface KPIMetrics {
  overallHealth: number;
  costHealth: number;
  scheduleHealth: number;
  progressHealth: number;
  productivity: number;
  progressVelocity: number;
  requiredVelocity: number;
  totalManhours: number;
  cpi: number;
  spi: number;
  actualProgress: number;
  plannedProgress: number;
}

// S-Curve Data Point interface
export interface SCurveDataPoint {
  date: string;
  plannedValue: number;
  earnedValue: number;
}

// Progress Report interface
export interface ProgressReport {
  id: string;
  projectId: string;
  reportDate: Date | string;
  reportType: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  cpi: number;
  spi: number;
  remarks: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Helper functions
export function formatProgress(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getVarianceColor(variance: number): string {
  if (variance > 0) return 'text-green-600';
  if (variance < 0) return 'text-red-600';
  return 'text-gray-600';
}

export function getPerformanceColor(index: number): string {
  if (index >= 1.05) return 'text-green-600 bg-green-50';
  if (index >= 0.95) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export function getHealthColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 80) return 'text-blue-600 bg-blue-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export function getStatusBadgeColor(status: string): string {
  if (status.includes('Under') || status.includes('Ahead')) {
    return 'bg-green-100 text-green-800';
  }
  if (status.includes('On')) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-red-100 text-red-800';
}
