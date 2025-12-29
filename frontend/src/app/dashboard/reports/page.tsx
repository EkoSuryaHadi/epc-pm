'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { ReportFormData } from '@/lib/validations/report';
import { useToast } from '@/hooks/use-toast';
import { FileText, Sparkles } from 'lucide-react';
import { createApiMethods } from '@/lib/api-client';
import { generatePDFReport } from '@/lib/utils/pdfExport';
import { generateExcelReport } from '@/lib/utils/excelExport';

export default function ReportsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<ReportFormData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.accessToken) {
      loadProjects();
    }
  }, [session]);

  const loadProjects = async () => {
    if (!session?.user?.accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const api = createApiMethods(session.user.accessToken);
      const response = await api.projects.getAll();
      const data = response.data;
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (data: ReportFormData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleGenerate = async (data: ReportFormData) => {
    try {
      console.log('Starting report generation with data:', data);
      
      toast({
        title: 'Generating Report',
        description: 'Your report is being generated...',
      });

      // Close preview if open
      setIsPreviewOpen(false);

      // Get project data
      const project = projects.find(p => p.id === data.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      console.log('Project found:', project);

      const projectData = {
        name: project.name || 'Unnamed Project',
        projectCode: project.projectCode || 'N/A',
        client: project.client || 'N/A',
        startDate: project.startDate || new Date(),
        status: project.status || 'UNKNOWN',
        totalBudget: project.totalBudget || 0,
      };

      console.log('Project data prepared:', projectData);

      // Fetch report data from APIs
      const reportApiData = await fetchReportData(data.projectId, data);
      
      console.log('Report API data fetched:', reportApiData);

      // Generate reports based on format
      const generatedFiles: string[] = [];

      if (data.format === 'PDF' || data.format === 'BOTH') {
        const pdfFile = await generatePDFReport(data, projectData, reportApiData);
        generatedFiles.push(pdfFile);
      }

      if (data.format === 'EXCEL' || data.format === 'BOTH') {
        const excelFile = await generateExcelReport(data, projectData, reportApiData);
        generatedFiles.push(excelFile);
      }

      toast({
        title: 'Report Generated Successfully!',
        description: `Generated: ${generatedFiles.join(', ')}`,
      });
      
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  const fetchReportData = async (projectId: number, reportData: ReportFormData) => {
    if (!session?.user?.accessToken) {
      throw new Error('Not authenticated');
    }

    const api = createApiMethods(session.user.accessToken);
    
    // Fetch data from various APIs based on selected sections
    const data: any = {
      progress: { overall: 0, planned: 0, physical: 0, wbsComplete: 0, milestonesComplete: 0 },
      evm: { pv: 0, ev: 0, ac: 0, cpi: 0, spi: 0, cv: 0, sv: 0, eac: 0, etc: 0, vac: 0 },
      cost: { byCategory: [], totalBudget: 0, totalActual: 0, totalCommitted: 0 },
      schedule: { totalTasks: 0, completedTasks: 0, inProgress: 0, notStarted: 0, delayedTasks: 0, onTimePercentage: 0, tasks: [] },
      risks: { total: 0, critical: 0, high: 0, medium: 0, low: 0, details: [] },
      changeOrders: { total: 0, totalValue: 0, approved: 0, approvedValue: 0, pending: 0, pendingValue: 0, rejected: 0, rejectedValue: 0, details: [] }
    };

    console.log('Fetching report data for project:', projectId);

    try {
      // Progress data
      if (reportData.sections.progressOverview || reportData.sections.evmMetrics) {
        try {
          const response = await api.progress.getReports(projectId.toString());
          const progressReports = response.data;
          const latestReport = progressReports[0];
          
          data.progress = {
            overall: latestReport?.progressPercentage || 0,
            planned: latestReport?.plannedProgress || 0,
            physical: latestReport?.physicalProgress || 0,
            wbsComplete: latestReport?.completedWBS || 0,
            milestonesComplete: latestReport?.completedMilestones || 0,
          };

          data.evm = {
            pv: latestReport?.plannedValue || 0,
            ev: latestReport?.earnedValue || 0,
            ac: latestReport?.actualCost || 0,
            cpi: latestReport?.cpi || 0,
            spi: latestReport?.spi || 0,
            cv: latestReport?.costVariance || 0,
            sv: latestReport?.scheduleVariance || 0,
            eac: latestReport?.estimateAtCompletion || 0,
            etc: latestReport?.estimateToComplete || 0,
            vac: latestReport?.varianceAtCompletion || 0,
          };
        } catch (e) {
          console.warn('Progress data not available:', e);
          // Keep default values
        }
      }

      // Cost data
      if (reportData.sections.budgetSummary || reportData.sections.costByCategory) {
        try {
          const response = await api.cost.getCostSummary(projectId.toString());
          const costSummary = response.data;
          data.cost = {
            byCategory: costSummary?.costByCategory || [],
            totalBudget: Number(costSummary?.totalBudget) || 0,
            totalActual: Number(costSummary?.totalActual) || 0,
            totalCommitted: Number(costSummary?.totalCommitted) || 0,
          };
          console.log('Cost data fetched:', data.cost);
        } catch (e) {
          console.warn('Cost data not available:', e);
          // Keep default values
        }
      }

      // Schedule data
      if (reportData.sections.scheduleOverview || reportData.sections.taskProgress) {
        try {
          const response = await api.schedule.getAll(projectId.toString());
          const tasks = response.data || [];
          const completedTasks = tasks.filter((t: any) => t.progress === 100).length;
          const inProgressTasks = tasks.filter((t: any) => t.progress > 0 && t.progress < 100).length;
          
          data.schedule = {
            totalTasks: tasks.length,
            completedTasks,
            inProgress: inProgressTasks,
            notStarted: tasks.length - completedTasks - inProgressTasks,
            delayedTasks: tasks.filter((t: any) => t.isDelayed).length,
            onTimePercentage: tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(2) : '0',
            tasks: tasks.slice(0, 50), // Limit to 50 tasks
          };
          console.log('Schedule data fetched:', data.schedule);
        } catch (e) {
          console.warn('Schedule data not available:', e);
          // Keep default values
        }
      }

      // Risk data
      if (reportData.sections.riskSummary || reportData.sections.riskMatrix) {
        try {
          const response = await api.risks.getAll(projectId.toString());
          const risks = response.data;
          const risksByLevel = risks.reduce((acc: any, risk: any) => {
            const level = risk.riskLevel?.toLowerCase() || 'low';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          }, {});

          data.risks = {
            total: risks.length,
            critical: risksByLevel.critical || 0,
            high: risksByLevel.high || 0,
            medium: risksByLevel.medium || 0,
            low: risksByLevel.low || 0,
            details: risks.slice(0, 50), // Limit to 50 risks
          };
        } catch (e) {
          console.warn('Risk data not available');
        }
      }

      // Change Orders data
      if (reportData.sections.changeOrders) {
        try {
          const response = await api.risks.getChangeOrders(projectId.toString());
          const changeOrders = response.data;
          const totalValue = changeOrders.reduce((sum: number, co: any) => sum + (co.costImpact || 0), 0);
          const approvedCOs = changeOrders.filter((co: any) => co.status === 'APPROVED');
          const pendingCOs = changeOrders.filter((co: any) => co.status === 'PENDING');
          const rejectedCOs = changeOrders.filter((co: any) => co.status === 'REJECTED');

          data.changeOrders = {
            total: changeOrders.length,
            totalValue,
            approved: approvedCOs.length,
            approvedValue: approvedCOs.reduce((sum: number, co: any) => sum + (co.costImpact || 0), 0),
            pending: pendingCOs.length,
            pendingValue: pendingCOs.reduce((sum: number, co: any) => sum + (co.costImpact || 0), 0),
            rejected: rejectedCOs.length,
            rejectedValue: rejectedCOs.reduce((sum: number, co: any) => sum + (co.costImpact || 0), 0),
            details: changeOrders.slice(0, 50), // Limit to 50 COs
          };
        } catch (e) {
          console.warn('Change order data not available');
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      return data;
    }
  };

  const handleGenerateFromPreview = () => {
    if (previewData) {
      handleGenerate(previewData);
    }
  };

  if (isLoading || !session) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isLoading && projects.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Available</h3>
            <p className="text-muted-foreground">
              Create a project first to generate reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Report Builder</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground">
          Generate comprehensive project reports in PDF or Excel format
        </p>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose the project you want to generate a report for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={selectedProjectId?.toString() || ''}
              onValueChange={(value) => {
                const projectId = Number(value);
                if (!isNaN(projectId)) {
                  setSelectedProjectId(projectId);
                }
              }}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name} - {project.projectCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProjectId && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Selected Project ID: <span className="font-semibold">{selectedProjectId}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Builder */}
      {selectedProjectId && (
        <ReportBuilder
          projectId={selectedProjectId}
          onPreview={handlePreview}
          onGenerate={handleGenerate}
        />
      )}

      {/* Report Preview Modal */}
      <ReportPreview
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportData={previewData}
        onGenerate={handleGenerateFromPreview}
      />
    </div>
  );
}
