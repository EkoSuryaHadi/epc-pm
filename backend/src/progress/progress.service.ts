import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async createUpdate(projectId: string, data: any, userId: string) {
    return this.prisma.progressUpdate.create({
      data: {
        ...data,
        projectId,
        createdById: userId,
      },
      include: {
        wbs: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.progressUpdate.findMany({
      where: { projectId },
      include: {
        wbs: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { reportDate: 'desc' },
    });
  }

  async getProgressSummary(projectId: string) {
    const wbsItems = await this.prisma.wBS.findMany({
      where: { projectId },
      include: {
        progress: {
          orderBy: { reportDate: 'desc' },
          take: 1,
        },
      },
    });

    let totalWeightage = 0;
    let weightedProgress = 0;
    let weightedPlanned = 0;

    wbsItems.forEach(wbs => {
      const weight = Number(wbs.weightage);
      totalWeightage += weight;

      if (wbs.progress.length > 0) {
        weightedProgress += weight * Number(wbs.progress[0].physicalProgress);
        weightedPlanned += weight * Number(wbs.progress[0].plannedProgress);
      }
    });

    const overallProgress = totalWeightage > 0 ? weightedProgress / totalWeightage : 0;
    const overallPlanned = totalWeightage > 0 ? weightedPlanned / totalWeightage : 0;

    return {
      overallProgress,
      overallPlanned,
      variance: overallProgress - overallPlanned,
      wbsProgress: wbsItems.map(wbs => ({
        wbsCode: wbs.code,
        wbsName: wbs.name,
        weightage: Number(wbs.weightage),
        progress: wbs.progress.length > 0 ? Number(wbs.progress[0].physicalProgress) : 0,
        planned: wbs.progress.length > 0 ? Number(wbs.progress[0].plannedProgress) : 0,
      })),
    };
  }

  async createReport(projectId: string, data: any) {
    return this.prisma.progressReport.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async getReports(projectId: string) {
    return this.prisma.progressReport.findMany({
      where: { projectId },
      orderBy: { reportDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.progressUpdate.findUnique({
      where: { id },
      include: {
        wbs: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.progressUpdate.update({
      where: { id },
      data,
      include: {
        wbs: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.progressUpdate.delete({
      where: { id },
    });
  }

  async getEVM(projectId: string) {
    // Get project budget
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const budget = Number(project.totalBudget);

    // Get progress summary for EV calculation
    const summary = await this.getProgressSummary(projectId);
    const actualProgress = summary.overallProgress;
    const plannedProgress = summary.overallPlanned;

    // Calculate Earned Value (EV) = Budget × Actual % Complete
    const earnedValue = (budget * actualProgress) / 100;

    // Calculate Planned Value (PV) = Budget × Planned % Complete
    const plannedValue = (budget * plannedProgress) / 100;

    // Get Actual Cost (AC) from cost entries
    const costEntries = await this.prisma.costEntry.findMany({
      where: { costCode: { projectId } },
    });

    const actualCost = costEntries.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0,
    );

    // Calculate variances
    const costVariance = earnedValue - actualCost; // CV
    const scheduleVariance = earnedValue - plannedValue; // SV

    // Calculate performance indices
    const cpi = actualCost > 0 ? earnedValue / actualCost : 1; // CPI
    const spi = plannedValue > 0 ? earnedValue / plannedValue : 1; // SPI

    // Calculate forecasts
    const estimateAtCompletion = cpi > 0 ? budget / cpi : budget; // EAC
    const estimateToComplete = estimateAtCompletion - actualCost; // ETC
    const varianceAtCompletion = budget - estimateAtCompletion; // VAC
    const toCompletePerformanceIndex =
      budget - earnedValue > 0 && budget - actualCost > 0
        ? (budget - earnedValue) / (budget - actualCost)
        : 1; // TCPI

    // Determine status
    let costStatus = 'On Budget';
    if (cpi > 1.05) costStatus = 'Under Budget';
    else if (cpi < 0.95) costStatus = 'Over Budget';

    let scheduleStatus = 'On Schedule';
    if (spi > 1.05) scheduleStatus = 'Ahead of Schedule';
    else if (spi < 0.95) scheduleStatus = 'Behind Schedule';

    return {
      budget,
      plannedValue,
      earnedValue,
      actualCost,
      costVariance,
      scheduleVariance,
      cpi,
      spi,
      estimateAtCompletion,
      estimateToComplete,
      varianceAtCompletion,
      toCompletePerformanceIndex,
      actualProgress,
      plannedProgress,
      progressVariance: actualProgress - plannedProgress,
      costStatus,
      scheduleStatus,
    };
  }

  async getKPI(projectId: string) {
    // Get EVM data
    const evm = await this.getEVM(projectId);

    // Get cost data
    const costCodes = await this.prisma.costCode.findMany({
      where: { projectId },
    });

    const costEntries = await this.prisma.costEntry.findMany({
      where: { costCode: { projectId } },
    });

    const totalBudget = costCodes.reduce(
      (sum, code) => sum + Number(code.budget),
      0,
    );

    const totalActual = costEntries
      .filter((e) => e.entryType === 'ACTUAL')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const variance = totalBudget - totalActual;
    const variancePercent =
      totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

    // Get schedule data
    const tasks = await this.prisma.schedule.findMany({
      where: { projectId },
    });

    const totalTasks = tasks.length;
    // Task is considered completed if progress >= 100
    const completedTasks = tasks.filter(
      (t) => Number(t.progress) >= 100,
    ).length;
    // Task is on time if completed and current date <= endDate
    const onTimeTasks = tasks.filter((t) => {
      if (Number(t.progress) < 100) return false;
      const today = new Date();
      return today <= t.endDate;
    }).length;
    const onTimePercent =
      completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0;

    // Get risk data
    const risks = await this.prisma.risk.findMany({
      where: { projectId },
    });

    const activeRisks = risks.filter(
      (r) => r.status !== 'CLOSED' && r.status !== 'ACCEPTED',
    ).length;

    const highRisks = risks.filter((r) => {
      const score = r.probability * r.impact;
      return score >= 15 && r.status !== 'CLOSED';
    }).length;

    // Get change order data
    const changeOrders = await this.prisma.changeOrder.findMany({
      where: { projectId },
    });

    const pendingChangeOrders = changeOrders.filter(
      (co) => co.status === 'PENDING',
    ).length;

    const changeImpact = changeOrders
      .filter((co) => co.status === 'APPROVED')
      .reduce((sum, co) => sum + Number(co.costImpact), 0);

    // Calculate health scores (0-100)
    const costHealth = Math.max(0, Math.min(100, evm.cpi * 100));
    const scheduleHealth = Math.max(0, Math.min(100, evm.spi * 100));
    const progressHealth = Math.max(
      0,
      Math.min(
        100,
        (evm.actualProgress / Math.max(1, evm.plannedProgress)) * 100,
      ),
    );

    // Overall health is weighted average
    const overallHealth =
      costHealth * 0.3 + scheduleHealth * 0.3 + progressHealth * 0.4;

    // Get productivity metrics
    const updates = await this.prisma.progressUpdate.findMany({
      where: { projectId },
      orderBy: { reportDate: 'desc' },
    });

    const totalManhours = updates.reduce(
      (sum, update) => sum + (Number(update.manhours) || 0),
      0,
    );

    const productivity =
      totalManhours > 0 ? (evm.actualProgress / totalManhours) * 100 : 0;

    // Calculate progress velocity (progress per week)
    const recentUpdates = updates.slice(0, 4); // Last 4 updates
    let progressVelocity = 0;
    if (recentUpdates.length >= 2) {
      const oldestUpdate = recentUpdates[recentUpdates.length - 1];
      const newestUpdate = recentUpdates[0];
      const progressDiff =
        Number(newestUpdate.physicalProgress) -
        Number(oldestUpdate.physicalProgress);
      const daysDiff =
        (new Date(newestUpdate.reportDate).getTime() -
          new Date(oldestUpdate.reportDate).getTime()) /
        (1000 * 60 * 60 * 24);
      const weeksDiff = daysDiff / 7;
      progressVelocity = weeksDiff > 0 ? progressDiff / weeksDiff : 0;
    }

    // Required velocity to complete on time
    const remainingProgress = 100 - evm.actualProgress;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    const endDate = project ? new Date(project.endDate) : new Date();
    const today = new Date();
    const remainingDays = Math.max(
      1,
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    const remainingWeeks = remainingDays / 7;
    const requiredVelocity = remainingProgress / remainingWeeks;

    return {
      // Cost KPIs
      totalBudget,
      totalActual,
      variance,
      variancePercent,
      cpi: evm.cpi,

      // Schedule KPIs
      plannedValue: evm.plannedValue,
      earnedValue: evm.earnedValue,
      scheduleVariance: evm.scheduleVariance,
      scheduleVariancePercent: evm.plannedValue > 0 ? (evm.scheduleVariance / evm.plannedValue) * 100 : 0,
      spi: evm.spi,

      // Progress KPIs
      overallProgress: evm.actualProgress,
      totalTasks,
      completedTasks,
      onTimePercent,

      // Risk & Change KPIs
      activeRisks,
      highRisks,
      changeOrders: pendingChangeOrders,
      changeImpact,

      // Health Metrics
      overallHealth,
      costHealth,
      scheduleHealth,
      progressHealth,
      productivity,
      progressVelocity,
      requiredVelocity,
      totalManhours,
      actualProgress: evm.actualProgress,
      plannedProgress: evm.plannedProgress,
    };
  }

  async getSCurve(projectId: string) {
    // Get all progress updates ordered by date
    const updates = await this.prisma.progressUpdate.findMany({
      where: { projectId },
      include: { wbs: true },
      orderBy: { reportDate: 'asc' },
    });

    // Group by date and calculate weighted progress
    const dateMap = new Map<string, { planned: number; actual: number }>();

    for (const update of updates) {
      const dateKey = update.reportDate.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { planned: 0, actual: 0 });
      }

      const entry = dateMap.get(dateKey)!;
      const weight = Number(update.wbs.weightage);
      entry.planned += (weight * Number(update.plannedProgress)) / 100;
      entry.actual += (weight * Number(update.physicalProgress)) / 100;
    }

    // Convert to array and calculate cumulative values
    const data: any[] = [];
    let cumulativePlanned = 0;
    let cumulativeActual = 0;

    for (const [date, values] of dateMap.entries()) {
      cumulativePlanned += values.planned;
      cumulativeActual += values.actual;

      data.push({
        date,
        plannedValue: cumulativePlanned,
        earnedValue: cumulativeActual,
      });
    }

    return data;
  }
}
