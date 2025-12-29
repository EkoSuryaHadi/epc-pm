import { z } from 'zod';

export const riskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  probability: z.number().min(1, 'Probability is required').max(5, 'Probability must be 1-5'),
  impact: z.number().min(1, 'Impact is required').max(5, 'Impact must be 1-5'),
  mitigation: z.string().optional(),
  owner: z.string().min(1, 'Owner is required'),
  status: z.enum(['IDENTIFIED', 'ANALYZING', 'MITIGATING', 'MONITORING', 'CLOSED']).default('IDENTIFIED'),
});

export type RiskFormData = z.infer<typeof riskSchema>;

export interface Risk extends RiskFormData {
  id: string;
  projectId: string;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export const changeOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['SCOPE', 'SCHEDULE', 'COST', 'QUALITY', 'OTHER']),
  costImpact: z.number().default(0),
  timeImpact: z.number().default(0), // days
  requestedBy: z.string().min(1, 'Requestor is required'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED']).default('PENDING'),
  approvedBy: z.string().optional(),
  justification: z.string().optional(),
});

export type ChangeOrderFormData = z.infer<typeof changeOrderSchema>;

export interface ChangeOrder extends ChangeOrderFormData {
  id: string;
  projectId: string;
  requestDate: Date;
  approvalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const RISK_CATEGORIES = [
  'Technical',
  'Financial',
  'Schedule',
  'Resource',
  'External',
  'Quality',
  'Safety',
  'Regulatory',
  'Contractual',
  'Other',
] as const;

export const RISK_STATUSES = [
  { value: 'IDENTIFIED', label: 'Identified', color: 'gray' },
  { value: 'ANALYZING', label: 'Analyzing', color: 'blue' },
  { value: 'MITIGATING', label: 'Mitigating', color: 'yellow' },
  { value: 'MONITORING', label: 'Monitoring', color: 'orange' },
  { value: 'CLOSED', label: 'Closed', color: 'green' },
] as const;

export const CHANGE_ORDER_TYPES = [
  { value: 'SCOPE', label: 'Scope Change', icon: '📋' },
  { value: 'SCHEDULE', label: 'Schedule Change', icon: '📅' },
  { value: 'COST', label: 'Cost Change', icon: '💰' },
  { value: 'QUALITY', label: 'Quality Change', icon: '⭐' },
  { value: 'OTHER', label: 'Other', icon: '📝' },
] as const;

export const CHANGE_ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending Review', color: 'yellow' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
  { value: 'IMPLEMENTED', label: 'Implemented', color: 'blue' },
] as const;

// Risk score calculation: probability × impact
export const calculateRiskScore = (probability: number, impact: number): number => {
  return probability * impact;
};

// Risk level based on score
export const getRiskLevel = (score: number): { level: string; color: string; label: string } => {
  if (score >= 20) return { level: 'EXTREME', color: 'red', label: 'Extreme Risk' };
  if (score >= 15) return { level: 'HIGH', color: 'orange', label: 'High Risk' };
  if (score >= 10) return { level: 'MEDIUM', color: 'yellow', label: 'Medium Risk' };
  if (score >= 5) return { level: 'LOW', color: 'blue', label: 'Low Risk' };
  return { level: 'VERY_LOW', color: 'green', label: 'Very Low Risk' };
};

// Risk matrix data structure
export interface RiskMatrixData {
  risks: Risk[];
  matrix: {
    [key: string]: Risk[]; // key: "probability-impact" (e.g., "3-4")
  };
  summary: {
    total: number;
    extreme: number;
    high: number;
    medium: number;
    low: number;
    veryLow: number;
  };
}
