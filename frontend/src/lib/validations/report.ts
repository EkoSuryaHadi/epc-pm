import { z } from 'zod';

export const reportTypes = [
  'PROGRESS',
  'COST',
  'SCHEDULE',
  'RISK',
  'COMPREHENSIVE',
] as const;

export const reportFormats = ['PDF', 'EXCEL', 'BOTH'] as const;

export const reportSchema = z.object({
  projectId: z.number().positive('Project is required'),
  reportType: z.enum(reportTypes, {
    required_error: 'Report type is required',
  }),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  dateFrom: z.date({ required_error: 'Start date is required' }),
  dateTo: z.date({ required_error: 'End date is required' }),
  format: z.enum(reportFormats),
  sections: z.object({
    // Progress Report Sections
    progressOverview: z.boolean().default(true),
    wbsProgress: z.boolean().default(true),
    milestones: z.boolean().default(true),
    evmMetrics: z.boolean().default(true),
    
    // Cost Report Sections
    budgetSummary: z.boolean().default(true),
    costByCategory: z.boolean().default(true),
    costVariance: z.boolean().default(true),
    costTrends: z.boolean().default(true),
    
    // Schedule Report Sections
    scheduleOverview: z.boolean().default(true),
    criticalPath: z.boolean().default(true),
    taskProgress: z.boolean().default(true),
    delayAnalysis: z.boolean().default(true),
    
    // Risk Report Sections
    riskSummary: z.boolean().default(true),
    riskMatrix: z.boolean().default(true),
    changeOrders: z.boolean().default(true),
    mitigationStatus: z.boolean().default(true),
    
    // Comprehensive Report (All)
    executiveSummary: z.boolean().default(true),
    allMetrics: z.boolean().default(true),
  }).default({}),
  includeCharts: z.boolean().default(true),
  includeComments: z.boolean().default(false),
}).refine((data) => data.dateTo >= data.dateFrom, {
  message: 'End date must be after start date',
  path: ['dateTo'],
});

export type ReportFormData = z.infer<typeof reportSchema>;

export const reportTypeLabels: Record<typeof reportTypes[number], string> = {
  PROGRESS: 'Progress Report',
  COST: 'Cost Report',
  SCHEDULE: 'Schedule Report',
  RISK: 'Risk Report',
  COMPREHENSIVE: 'Comprehensive Report',
};

export const reportTypeDescriptions: Record<typeof reportTypes[number], string> = {
  PROGRESS: 'Project progress, EVM metrics, and milestone achievement',
  COST: 'Budget tracking, cost variance, and expenditure analysis',
  SCHEDULE: 'Schedule performance, critical path, and task progress',
  RISK: 'Risk assessment, change orders, and mitigation tracking',
  COMPREHENSIVE: 'Complete project report with all metrics and analysis',
};

export const getDefaultSections = (reportType: typeof reportTypes[number]) => {
  switch (reportType) {
    case 'PROGRESS':
      return {
        progressOverview: true,
        wbsProgress: true,
        milestones: true,
        evmMetrics: true,
        budgetSummary: false,
        costByCategory: false,
        costVariance: false,
        costTrends: false,
        scheduleOverview: false,
        criticalPath: false,
        taskProgress: false,
        delayAnalysis: false,
        riskSummary: false,
        riskMatrix: false,
        changeOrders: false,
        mitigationStatus: false,
        executiveSummary: true,
        allMetrics: false,
      };
    case 'COST':
      return {
        progressOverview: false,
        wbsProgress: false,
        milestones: false,
        evmMetrics: true,
        budgetSummary: true,
        costByCategory: true,
        costVariance: true,
        costTrends: true,
        scheduleOverview: false,
        criticalPath: false,
        taskProgress: false,
        delayAnalysis: false,
        riskSummary: false,
        riskMatrix: false,
        changeOrders: false,
        mitigationStatus: false,
        executiveSummary: true,
        allMetrics: false,
      };
    case 'SCHEDULE':
      return {
        progressOverview: false,
        wbsProgress: false,
        milestones: true,
        evmMetrics: false,
        budgetSummary: false,
        costByCategory: false,
        costVariance: false,
        costTrends: false,
        scheduleOverview: true,
        criticalPath: true,
        taskProgress: true,
        delayAnalysis: true,
        riskSummary: false,
        riskMatrix: false,
        changeOrders: false,
        mitigationStatus: false,
        executiveSummary: true,
        allMetrics: false,
      };
    case 'RISK':
      return {
        progressOverview: false,
        wbsProgress: false,
        milestones: false,
        evmMetrics: false,
        budgetSummary: false,
        costByCategory: false,
        costVariance: false,
        costTrends: false,
        scheduleOverview: false,
        criticalPath: false,
        taskProgress: false,
        delayAnalysis: false,
        riskSummary: true,
        riskMatrix: true,
        changeOrders: true,
        mitigationStatus: true,
        executiveSummary: true,
        allMetrics: false,
      };
    case 'COMPREHENSIVE':
      return {
        progressOverview: true,
        wbsProgress: true,
        milestones: true,
        evmMetrics: true,
        budgetSummary: true,
        costByCategory: true,
        costVariance: true,
        costTrends: true,
        scheduleOverview: true,
        criticalPath: true,
        taskProgress: true,
        delayAnalysis: true,
        riskSummary: true,
        riskMatrix: true,
        changeOrders: true,
        mitigationStatus: true,
        executiveSummary: true,
        allMetrics: true,
      };
  }
};
