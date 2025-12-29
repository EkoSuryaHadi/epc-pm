import * as XLSX from 'xlsx';
import { ReportFormData } from '../validations/report';
import { format } from 'date-fns';

interface ProjectData {
  name: string;
  projectCode: string;
  client?: string;
  startDate?: string;
  status?: string;
}

export async function generateExcelReport(
  reportData: ReportFormData,
  projectData: ProjectData,
  data: any
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['PROJECT REPORT'],
    [''],
    ['Report Title', reportData.title],
    ['Report Type', reportData.reportType],
    ['Report Date', format(new Date(), 'PPP')],
    [''],
    ['PROJECT INFORMATION'],
    ['Project Name', projectData.name],
    ['Project Code', projectData.projectCode],
    ['Client', projectData.client || 'N/A'],
    ['Status', projectData.status || 'N/A'],
    [''],
    ['REPORT PERIOD'],
    ['From Date', format(reportData.dateFrom, 'PPP')],
    ['To Date', format(reportData.dateTo, 'PPP')],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Style the summary sheet
  if (!summarySheet['!cols']) summarySheet['!cols'] = [];
  summarySheet['!cols'][0] = { wch: 20 };
  summarySheet['!cols'][1] = { wch: 40 };
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Progress Sheet (if included)
  if (reportData.sections.progressOverview && data.progress) {
    const progressData = [
      ['PROGRESS OVERVIEW'],
      [''],
      ['Metric', 'Value', 'Unit'],
      ['Overall Progress', data.progress.overall || 0, '%'],
      ['Planned Progress', data.progress.planned || 0, '%'],
      ['Physical Progress', data.progress.physical || 0, '%'],
      ['Variance', ((data.progress.physical || 0) - (data.progress.planned || 0)).toFixed(2), '%'],
      [''],
      ['WBS Progress', data.progress.wbsComplete || 0, 'items'],
      ['Milestones Completed', data.progress.milestonesComplete || 0, 'items'],
    ];

    const progressSheet = XLSX.utils.aoa_to_sheet(progressData);
    
    if (!progressSheet['!cols']) progressSheet['!cols'] = [];
    progressSheet['!cols'][0] = { wch: 25 };
    progressSheet['!cols'][1] = { wch: 15 };
    progressSheet['!cols'][2] = { wch: 10 };
    
    XLSX.utils.book_append_sheet(workbook, progressSheet, 'Progress');
  }

  // EVM Sheet (if included)
  if (reportData.sections.evmMetrics && data.evm) {
    const evmData = [
      ['EARNED VALUE MANAGEMENT METRICS'],
      [''],
      ['Metric', 'Value', 'Status'],
      ['Planned Value (PV)', formatCurrency(data.evm.pv || 0), '-'],
      ['Earned Value (EV)', formatCurrency(data.evm.ev || 0), '-'],
      ['Actual Cost (AC)', formatCurrency(data.evm.ac || 0), '-'],
      [''],
      ['Cost Performance Index (CPI)', (data.evm.cpi || 0).toFixed(3), getCPIStatus(data.evm.cpi || 0)],
      ['Schedule Performance Index (SPI)', (data.evm.spi || 0).toFixed(3), getSPIStatus(data.evm.spi || 0)],
      [''],
      ['Cost Variance (CV)', formatCurrency(data.evm.cv || 0), getVarianceStatus(data.evm.cv || 0)],
      ['Schedule Variance (SV)', formatCurrency(data.evm.sv || 0), getVarianceStatus(data.evm.sv || 0)],
      [''],
      ['Estimate at Completion (EAC)', formatCurrency(data.evm.eac || 0), '-'],
      ['Estimate to Complete (ETC)', formatCurrency(data.evm.etc || 0), '-'],
      ['Variance at Completion (VAC)', formatCurrency(data.evm.vac || 0), '-'],
    ];

    const evmSheet = XLSX.utils.aoa_to_sheet(evmData);
    
    if (!evmSheet['!cols']) evmSheet['!cols'] = [];
    evmSheet['!cols'][0] = { wch: 35 };
    evmSheet['!cols'][1] = { wch: 20 };
    evmSheet['!cols'][2] = { wch: 15 };
    
    XLSX.utils.book_append_sheet(workbook, evmSheet, 'EVM');
  }

  // Cost Sheet (if included)
  if (reportData.sections.budgetSummary && data.cost) {
    const costData = [
      ['BUDGET SUMMARY'],
      [''],
      ['Category', 'Budget', 'Actual', 'Committed', 'Variance', 'Variance %'],
    ];

    // Add cost by category
    if (data.cost.byCategory && data.cost.byCategory.length > 0) {
      data.cost.byCategory.forEach((item: any) => {
        const variance = (item.budget || 0) - (item.actual || 0);
        const variancePct = ((item.actual || 0) / (item.budget || 1) - 1) * 100;
        costData.push([
          item.category,
          item.budget || 0,
          item.actual || 0,
          item.committed || 0,
          variance,
          `${variancePct.toFixed(2)}%`,
        ]);
      });

      // Add totals
      const totalBudget = data.cost.byCategory.reduce((sum: number, item: any) => sum + (item.budget || 0), 0);
      const totalActual = data.cost.byCategory.reduce((sum: number, item: any) => sum + (item.actual || 0), 0);
      const totalCommitted = data.cost.byCategory.reduce((sum: number, item: any) => sum + (item.committed || 0), 0);
      costData.push(['']);
      costData.push([
        'TOTAL',
        totalBudget,
        totalActual,
        totalCommitted,
        totalBudget - totalActual,
        `${((totalActual / totalBudget - 1) * 100).toFixed(2)}%`,
      ]);
    }

    const costSheet = XLSX.utils.aoa_to_sheet(costData);
    
    if (!costSheet['!cols']) costSheet['!cols'] = [];
    costSheet['!cols'][0] = { wch: 25 };
    costSheet['!cols'][1] = { wch: 15 };
    costSheet['!cols'][2] = { wch: 15 };
    costSheet['!cols'][3] = { wch: 15 };
    costSheet['!cols'][4] = { wch: 15 };
    costSheet['!cols'][5] = { wch: 12 };
    
    XLSX.utils.book_append_sheet(workbook, costSheet, 'Cost Analysis');
  }

  // Schedule Sheet (if included)
  if (reportData.sections.scheduleOverview && data.schedule) {
    const scheduleData = [
      ['SCHEDULE OVERVIEW'],
      [''],
      ['Metric', 'Value'],
      ['Total Tasks', data.schedule.totalTasks || 0],
      ['Completed Tasks', data.schedule.completedTasks || 0],
      ['In Progress', data.schedule.inProgress || 0],
      ['Not Started', data.schedule.notStarted || 0],
      ['Delayed Tasks', data.schedule.delayedTasks || 0],
      [''],
      ['Completion Rate', `${((data.schedule.completedTasks || 0) / (data.schedule.totalTasks || 1) * 100).toFixed(2)}%`],
      ['On-Time Performance', `${data.schedule.onTimePercentage || 0}%`],
    ];

    // Add task details if available
    if (data.schedule.tasks && data.schedule.tasks.length > 0) {
      scheduleData.push(['']);
      scheduleData.push(['TASK DETAILS']);
      scheduleData.push(['Task Name', 'Start Date', 'End Date', 'Progress', 'Status']);
      
      data.schedule.tasks.forEach((task: any) => {
        scheduleData.push([
          task.name,
          task.startDate ? format(new Date(task.startDate), 'PP') : 'N/A',
          task.endDate ? format(new Date(task.endDate), 'PP') : 'N/A',
          `${task.progress || 0}%`,
          task.status || 'N/A',
        ]);
      });
    }

    const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
    
    if (!scheduleSheet['!cols']) scheduleSheet['!cols'] = [];
    scheduleSheet['!cols'][0] = { wch: 30 };
    scheduleSheet['!cols'][1] = { wch: 15 };
    scheduleSheet['!cols'][2] = { wch: 15 };
    scheduleSheet['!cols'][3] = { wch: 12 };
    scheduleSheet['!cols'][4] = { wch: 15 };
    
    XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule');
  }

  // Risk Sheet (if included)
  if (reportData.sections.riskSummary && data.risks) {
    const riskData = [
      ['RISK SUMMARY'],
      [''],
      ['Risk Level', 'Count', 'Percentage'],
      ['Critical', data.risks.critical || 0, `${((data.risks.critical || 0) / (data.risks.total || 1) * 100).toFixed(2)}%`],
      ['High', data.risks.high || 0, `${((data.risks.high || 0) / (data.risks.total || 1) * 100).toFixed(2)}%`],
      ['Medium', data.risks.medium || 0, `${((data.risks.medium || 0) / (data.risks.total || 1) * 100).toFixed(2)}%`],
      ['Low', data.risks.low || 0, `${((data.risks.low || 0) / (data.risks.total || 1) * 100).toFixed(2)}%`],
      [''],
      ['Total Risks', data.risks.total || 0, '100%'],
    ];

    // Add risk details if available
    if (data.risks.details && data.risks.details.length > 0) {
      riskData.push(['']);
      riskData.push(['RISK DETAILS']);
      riskData.push(['Risk Description', 'Category', 'Probability', 'Impact', 'Risk Score', 'Status']);
      
      data.risks.details.forEach((risk: any) => {
        riskData.push([
          risk.description || 'N/A',
          risk.category || 'N/A',
          risk.probability || 0,
          risk.impact || 0,
          (risk.probability || 0) * (risk.impact || 0),
          risk.status || 'N/A',
        ]);
      });
    }

    const riskSheet = XLSX.utils.aoa_to_sheet(riskData);
    
    if (!riskSheet['!cols']) riskSheet['!cols'] = [];
    riskSheet['!cols'][0] = { wch: 40 };
    riskSheet['!cols'][1] = { wch: 15 };
    riskSheet['!cols'][2] = { wch: 12 };
    riskSheet['!cols'][3] = { wch: 12 };
    riskSheet['!cols'][4] = { wch: 12 };
    riskSheet['!cols'][5] = { wch: 15 };
    
    XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risks');
  }

  // Change Orders Sheet (if included)
  if (reportData.sections.changeOrders && data.changeOrders) {
    const changeOrderData = [
      ['CHANGE ORDERS'],
      [''],
      ['Summary', 'Count', 'Value'],
      ['Total Change Orders', data.changeOrders.total || 0, formatCurrency(data.changeOrders.totalValue || 0)],
      ['Approved', data.changeOrders.approved || 0, formatCurrency(data.changeOrders.approvedValue || 0)],
      ['Pending', data.changeOrders.pending || 0, formatCurrency(data.changeOrders.pendingValue || 0)],
      ['Rejected', data.changeOrders.rejected || 0, formatCurrency(data.changeOrders.rejectedValue || 0)],
    ];

    // Add change order details if available
    if (data.changeOrders.details && data.changeOrders.details.length > 0) {
      changeOrderData.push(['']);
      changeOrderData.push(['CHANGE ORDER DETAILS']);
      changeOrderData.push(['CO Number', 'Description', 'Type', 'Cost Impact', 'Time Impact', 'Status']);
      
      data.changeOrders.details.forEach((co: any) => {
        changeOrderData.push([
          co.number || 'N/A',
          co.description || 'N/A',
          co.type || 'N/A',
          formatCurrency(co.costImpact || 0),
          `${co.timeImpact || 0} days`,
          co.status || 'N/A',
        ]);
      });
    }

    const coSheet = XLSX.utils.aoa_to_sheet(changeOrderData);
    
    if (!coSheet['!cols']) coSheet['!cols'] = [];
    coSheet['!cols'][0] = { wch: 15 };
    coSheet['!cols'][1] = { wch: 40 };
    coSheet['!cols'][2] = { wch: 15 };
    coSheet['!cols'][3] = { wch: 15 };
    coSheet['!cols'][4] = { wch: 15 };
    coSheet['!cols'][5] = { wch: 15 };
    
    XLSX.utils.book_append_sheet(workbook, coSheet, 'Change Orders');
  }

  // Save Excel file
  const fileName = `${projectData.projectCode}_${reportData.reportType}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getCPIStatus(cpi: number): string {
  if (cpi >= 1) return 'Good';
  if (cpi >= 0.9) return 'Fair';
  return 'Poor';
}

function getSPIStatus(spi: number): string {
  if (spi >= 1) return 'On Track';
  if (spi >= 0.9) return 'At Risk';
  return 'Behind';
}

function getVarianceStatus(variance: number): string {
  if (variance > 0) return 'Favorable';
  if (variance === 0) return 'On Budget';
  return 'Unfavorable';
}
