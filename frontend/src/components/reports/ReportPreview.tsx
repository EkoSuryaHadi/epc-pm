'use client';

import { ReportFormData, reportTypeLabels } from '@/lib/validations/report';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ReportPreviewProps {
  open: boolean;
  onClose: () => void;
  reportData: ReportFormData | null;
  onGenerate: () => void;
}

export function ReportPreview({ open, onClose, reportData, onGenerate }: ReportPreviewProps) {
  if (!reportData) return null;

  const selectedSections = Object.entries(reportData.sections)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  const sectionLabels: Record<string, string> = {
    executiveSummary: 'Executive Summary',
    progressOverview: 'Progress Overview',
    wbsProgress: 'WBS Progress Details',
    milestones: 'Milestone Achievement',
    evmMetrics: 'EVM Metrics (CPI, SPI)',
    budgetSummary: 'Budget Summary',
    costByCategory: 'Cost by Category',
    costVariance: 'Cost Variance Analysis',
    costTrends: 'Cost Trend Charts',
    scheduleOverview: 'Schedule Overview',
    criticalPath: 'Critical Path Analysis',
    taskProgress: 'Task Progress Details',
    delayAnalysis: 'Delay Analysis',
    riskSummary: 'Risk Summary',
    riskMatrix: 'Risk Assessment Matrix',
    changeOrders: 'Change Orders',
    mitigationStatus: 'Mitigation Status',
    allMetrics: 'All Metrics',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Preview</DialogTitle>
          <DialogDescription>
            Review your report configuration before generating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Header */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Report Type</p>
              <p className="text-lg font-semibold">{reportTypeLabels[reportData.reportType]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{reportData.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">From Date</p>
                <p className="font-medium">{format(reportData.dateFrom, 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To Date</p>
                <p className="font-medium">{format(reportData.dateTo, 'PPP')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Export Format</p>
              <Badge>{reportData.format}</Badge>
            </div>
          </div>

          {/* Report Content Preview */}
          <div>
            <h4 className="font-semibold mb-3">Report Sections ({selectedSections.length})</h4>
            <div className="space-y-2">
              {selectedSections.map((section) => (
                <div
                  key={section}
                  className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{sectionLabels[section] || section}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <h4 className="font-semibold mb-3">Additional Options</h4>
            <div className="space-y-2">
              {reportData.includeCharts && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Include Charts and Graphs</span>
                </div>
              )}
              {reportData.includeComments && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Include Comments and Notes</span>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Report Size */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Report Details</p>
                <p className="text-sm text-blue-700 mt-1">
                  Estimated {selectedSections.length} sections • {reportData.format} format
                  {reportData.includeCharts && ' • With visualizations'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={onGenerate} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
