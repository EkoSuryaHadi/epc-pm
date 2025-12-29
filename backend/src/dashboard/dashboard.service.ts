import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getProjectDashboard(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            wbs: true,
            costCodes: true,
            schedules: true,
            documents: true,
            risks: true,
          },
        },
      },
    });

    const costSummary = await this.getCostSummary(projectId);
    const progressSummary = await this.getProgressSummary(projectId);
    const scheduleSummary = await this.getScheduleSummary(projectId);
    const riskSummary = await this.getRiskSummary(projectId);

    return {
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      counts: project._count,
      cost: costSummary,
      progress: progressSummary,
      schedule: scheduleSummary,
      risks: riskSummary,
    };
  }

  private async getCostSummary(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    const costEntries = await this.prisma.costEntry.findMany({
      where: { projectId },
    });

    const totalActual = costEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const totalBudget = Number(project.totalBudget);
    const variance = totalBudget - totalActual;

    return {
      budget: totalBudget,
      actual: totalActual,
      variance,
      utilizationPercent: (totalActual / totalBudget) * 100,
    };
  }

  private async getProgressSummary(projectId: string) {
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

    wbsItems.forEach(wbs => {
      const weight = Number(wbs.weightage);
      totalWeightage += weight;

      if (wbs.progress.length > 0) {
        weightedProgress += weight * Number(wbs.progress[0].physicalProgress);
      }
    });

    const overallProgress = totalWeightage > 0 ? weightedProgress / totalWeightage : 0;

    return {
      overallProgress,
      totalWbs: wbsItems.length,
    };
  }

  private async getScheduleSummary(projectId: string) {
    const schedules = await this.prisma.schedule.findMany({
      where: { projectId },
    });

    const now = new Date();
    const completed = schedules.filter(s => Number(s.progress) === 100).length;
    const inProgress = schedules.filter(s => Number(s.progress) > 0 && Number(s.progress) < 100).length;
    const notStarted = schedules.filter(s => Number(s.progress) === 0).length;
    const delayed = schedules.filter(s => s.endDate < now && Number(s.progress) < 100).length;

    return {
      total: schedules.length,
      completed,
      inProgress,
      notStarted,
      delayed,
    };
  }

  private async getRiskSummary(projectId: string) {
    const risks = await this.prisma.risk.findMany({
      where: { projectId },
    });

    return {
      total: risks.length,
      open: risks.filter(r => r.status === 'Open').length,
      critical: risks.filter(r => r.riskScore >= 15).length,
      high: risks.filter(r => r.riskScore >= 9 && r.riskScore < 15).length,
    };
  }
}
