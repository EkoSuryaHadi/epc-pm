import { reportSchema, getDefaultSections } from './report';

describe('Report Validation', () => {
  describe('reportSchema', () => {
    it('validates a valid report configuration', () => {
      const validData = {
        projectId: 1,
        reportType: 'PROGRESS' as const,
        title: 'Monthly Progress Report',
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-01-31'),
        format: 'PDF' as const,
        sections: {
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
        },
        includeCharts: true,
        includeComments: false,
      };

      const result = reportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid project ID', () => {
      const invalidData = {
        projectId: -1,
        reportType: 'PROGRESS',
        title: 'Test',
        dateFrom: new Date(),
        dateTo: new Date(),
        format: 'PDF',
      };

      const result = reportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('requires title to be at least 3 characters', () => {
      const invalidData = {
        projectId: 1,
        reportType: 'PROGRESS',
        title: 'AB',
        dateFrom: new Date(),
        dateTo: new Date(),
        format: 'PDF',
      };

      const result = reportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('validates date range (dateTo must be after dateFrom)', () => {
      const invalidData = {
        projectId: 1,
        reportType: 'PROGRESS',
        title: 'Test Report',
        dateFrom: new Date('2025-02-01'),
        dateTo: new Date('2025-01-01'),
        format: 'PDF',
      };

      const result = reportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts valid export formats', () => {
      const formats = ['PDF', 'EXCEL', 'BOTH'] as const;
      
      formats.forEach(format => {
        const data = {
          projectId: 1,
          reportType: 'PROGRESS' as const,
          title: 'Test',
          dateFrom: new Date('2025-01-01'),
          dateTo: new Date('2025-01-31'),
          format,
        };

        const result = reportSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('getDefaultSections', () => {
    it('returns correct sections for PROGRESS report', () => {
      const sections = getDefaultSections('PROGRESS');
      
      expect(sections.progressOverview).toBe(true);
      expect(sections.wbsProgress).toBe(true);
      expect(sections.milestones).toBe(true);
      expect(sections.evmMetrics).toBe(true);
      expect(sections.costByCategory).toBe(false);
      expect(sections.scheduleOverview).toBe(false);
    });

    it('returns correct sections for COST report', () => {
      const sections = getDefaultSections('COST');
      
      expect(sections.budgetSummary).toBe(true);
      expect(sections.costByCategory).toBe(true);
      expect(sections.costVariance).toBe(true);
      expect(sections.evmMetrics).toBe(true);
      expect(sections.progressOverview).toBe(false);
      expect(sections.scheduleOverview).toBe(false);
    });

    it('returns correct sections for SCHEDULE report', () => {
      const sections = getDefaultSections('SCHEDULE');
      
      expect(sections.scheduleOverview).toBe(true);
      expect(sections.criticalPath).toBe(true);
      expect(sections.taskProgress).toBe(true);
      expect(sections.milestones).toBe(true);
      expect(sections.costByCategory).toBe(false);
      expect(sections.riskSummary).toBe(false);
    });

    it('returns correct sections for RISK report', () => {
      const sections = getDefaultSections('RISK');
      
      expect(sections.riskSummary).toBe(true);
      expect(sections.riskMatrix).toBe(true);
      expect(sections.changeOrders).toBe(true);
      expect(sections.mitigationStatus).toBe(true);
      expect(sections.progressOverview).toBe(false);
      expect(sections.costByCategory).toBe(false);
    });

    it('returns all sections enabled for COMPREHENSIVE report', () => {
      const sections = getDefaultSections('COMPREHENSIVE');
      
      expect(sections.progressOverview).toBe(true);
      expect(sections.budgetSummary).toBe(true);
      expect(sections.scheduleOverview).toBe(true);
      expect(sections.riskSummary).toBe(true);
      expect(sections.allMetrics).toBe(true);
    });
  });
});
