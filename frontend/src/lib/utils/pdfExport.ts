import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportFormData } from '../validations/report';
import { format } from 'date-fns';

interface ProjectData {
  name: string;
  projectCode: string;
  client?: string;
  startDate?: string;
  status?: string;
}

export async function generatePDFReport(
  reportData: ReportFormData,
  projectData: ProjectData,
  data: any
) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(reportData.title, 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPP')}`, 105, yPos, { align: 'center' });
  
  yPos += 15;

  // Project Information Box
  doc.setDrawColor(200);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, yPos, 180, 30, 3, 3, 'FD');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Information', 20, yPos + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${projectData.name}`, 20, yPos + 15);
  doc.text(`Code: ${projectData.projectCode}`, 20, yPos + 20);
  if (projectData.client) {
    doc.text(`Client: ${projectData.client}`, 20, yPos + 25);
  }
  
  doc.text(`Report Period: ${format(reportData.dateFrom, 'PP')} - ${format(reportData.dateTo, 'PP')}`, 110, yPos + 15);
  if (projectData.status) {
    doc.text(`Status: ${projectData.status}`, 110, yPos + 20);
  }
  
  yPos += 40;

  // Executive Summary (if included)
  if (reportData.sections.executiveSummary) {
    yPos = addSection(doc, 'Executive Summary', yPos);
    doc.setFontSize(9);
    doc.text('This report provides a comprehensive overview of project performance', 20, yPos);
    yPos += 6;
    doc.text(`during the period from ${format(reportData.dateFrom, 'PP')} to ${format(reportData.dateTo, 'PP')}.`, 20, yPos);
    yPos += 10;
  }

  // Progress Sections
  if (reportData.sections.progressOverview && data.progress) {
    yPos = checkNewPage(doc, yPos, 50);
    yPos = addSection(doc, 'Progress Overview', yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Progress', `${data.progress.overall || 0}%`],
        ['Planned Progress', `${data.progress.planned || 0}%`],
        ['Physical Progress', `${data.progress.physical || 0}%`],
        ['Variance', `${((data.progress.physical || 0) - (data.progress.planned || 0)).toFixed(2)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // EVM Metrics
  if (reportData.sections.evmMetrics && data.evm) {
    yPos = checkNewPage(doc, yPos, 60);
    yPos = addSection(doc, 'Earned Value Management Metrics', yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value', 'Status']],
      body: [
        ['Planned Value (PV)', formatCurrency(data.evm.pv || 0), '-'],
        ['Earned Value (EV)', formatCurrency(data.evm.ev || 0), '-'],
        ['Actual Cost (AC)', formatCurrency(data.evm.ac || 0), '-'],
        ['Cost Performance Index (CPI)', (data.evm.cpi || 0).toFixed(2), getCPIStatus(data.evm.cpi || 0)],
        ['Schedule Performance Index (SPI)', (data.evm.spi || 0).toFixed(2), getSPIStatus(data.evm.spi || 0)],
        ['Cost Variance (CV)', formatCurrency(data.evm.cv || 0), getVarianceStatus(data.evm.cv || 0)],
        ['Schedule Variance (SV)', formatCurrency(data.evm.sv || 0), getVarianceStatus(data.evm.sv || 0)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Cost Summary
  if (reportData.sections.budgetSummary && data.cost) {
    yPos = checkNewPage(doc, yPos, 50);
    yPos = addSection(doc, 'Budget Summary', yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Budget', 'Actual', 'Variance', 'Variance %']],
      body: (data.cost.byCategory || []).map((item: any) => [
        item.category,
        formatCurrency(item.budget || 0),
        formatCurrency(item.actual || 0),
        formatCurrency((item.budget || 0) - (item.actual || 0)),
        `${(((item.actual || 0) / (item.budget || 1) - 1) * 100).toFixed(1)}%`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Schedule Overview
  if (reportData.sections.scheduleOverview && data.schedule) {
    yPos = checkNewPage(doc, yPos, 50);
    yPos = addSection(doc, 'Schedule Overview', yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Tasks', data.schedule.totalTasks || 0],
        ['Completed Tasks', data.schedule.completedTasks || 0],
        ['In Progress', data.schedule.inProgress || 0],
        ['Not Started', data.schedule.notStarted || 0],
        ['Delayed Tasks', data.schedule.delayedTasks || 0],
        ['On-Time Performance', `${data.schedule.onTimePercentage || 0}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Risk Summary
  if (reportData.sections.riskSummary && data.risks) {
    yPos = checkNewPage(doc, yPos, 50);
    yPos = addSection(doc, 'Risk Summary', yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Risk Level', 'Count', 'Percentage']],
      body: [
        ['Critical', data.risks.critical || 0, `${((data.risks.critical || 0) / (data.risks.total || 1) * 100).toFixed(1)}%`],
        ['High', data.risks.high || 0, `${((data.risks.high || 0) / (data.risks.total || 1) * 100).toFixed(1)}%`],
        ['Medium', data.risks.medium || 0, `${((data.risks.medium || 0) / (data.risks.total || 1) * 100).toFixed(1)}%`],
        ['Low', data.risks.low || 0, `${((data.risks.low || 0) / (data.risks.total || 1) * 100).toFixed(1)}%`],
        ['Total', data.risks.total || 0, '100%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `${projectData.name} - ${reportData.title}`,
      20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save PDF
  const fileName = `${projectData.projectCode}_${reportData.reportType}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
  
  return fileName;
}

function addSection(doc: jsPDF, title: string, yPos: number): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, yPos);
  doc.setDrawColor(66, 139, 202);
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 2, 190, yPos + 2);
  return yPos + 10;
}

function checkNewPage(doc: jsPDF, yPos: number, requiredSpace: number): number {
  if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 20;
  }
  return yPos;
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
