import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, data: any) {
    return this.prisma.schedule.create({
      data: {
        ...data,
        projectId,
      },
      include: {
        wbs: true,
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.schedule.findMany({
      where: { projectId },
      include: {
        wbs: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        wbs: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.schedule.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.schedule.delete({ where: { id } });
  }

  async getMilestones(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { targetDate: 'asc' },
    });
  }

  async createMilestone(projectId: string, data: any) {
    return this.prisma.milestone.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async updateMilestone(id: string, data: any) {
    return this.prisma.milestone.update({
      where: { id },
      data,
    });
  }

  async deleteMilestone(id: string) {
    return this.prisma.milestone.delete({
      where: { id },
    });
  }

  // ========== BASELINE METHODS ==========

  async getBaselines(projectId: string) {
    return this.prisma.scheduleBaseline.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBaseline(id: string) {
    return this.prisma.scheduleBaseline.findUnique({
      where: { id },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async createBaseline(projectId: string, data: any, userId: string) {
    const { name, description, setAsActive } = data;

    // Get all schedule tasks for this project
    const scheduleTasks = await this.prisma.schedule.findMany({
      where: { projectId },
    });

    if (scheduleTasks.length === 0) {
      throw new Error('No schedule tasks found. Cannot create baseline.');
    }

    // If setAsActive, deactivate all other baselines first
    if (setAsActive) {
      await this.prisma.scheduleBaseline.updateMany({
        where: { projectId, isActive: true },
        data: { isActive: false },
      });
    }

    // Create baseline with all tasks
    return this.prisma.scheduleBaseline.create({
      data: {
        projectId,
        name,
        description,
        isActive: setAsActive || false,
        createdById: userId,
        tasks: {
          create: scheduleTasks.map((task) => ({
            scheduleId: task.id,
            taskName: task.taskName,
            plannedStart: task.startDate,
            plannedEnd: task.endDate,
            plannedDuration: task.duration,
            plannedProgress: task.progress,
            wbsId: task.wbsId,
          })),
        },
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async updateBaseline(id: string, data: any) {
    const { name, description } = data;
    return this.prisma.scheduleBaseline.update({
      where: { id },
      data: { name, description },
    });
  }

  async deleteBaseline(id: string) {
    return this.prisma.scheduleBaseline.delete({
      where: { id },
    });
  }

  async activateBaseline(id: string, projectId: string) {
    // Deactivate all baselines for this project
    await this.prisma.scheduleBaseline.updateMany({
      where: { projectId, isActive: true },
      data: { isActive: false },
    });

    // Activate this baseline
    return this.prisma.scheduleBaseline.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async getBaselineTasks(baselineId: string) {
    return this.prisma.scheduleBaselineTask.findMany({
      where: { baselineId },
      orderBy: { plannedStart: 'asc' },
    });
  }

  async getVarianceReport(baselineId: string) {
    const baseline = await this.prisma.scheduleBaseline.findUnique({
      where: { id: baselineId },
      include: { tasks: true },
    });

    if (!baseline) {
      throw new Error('Baseline not found');
    }

    // Get current schedule tasks
    const currentTasks = await this.prisma.schedule.findMany({
      where: { projectId: baseline.projectId },
    });

    // Build variance report
    const varianceReport = baseline.tasks.map((baselineTask) => {
      const actualTask = currentTasks.find(
        (t) => t.id === baselineTask.scheduleId
      );

      if (!actualTask) {
        return {
          taskId: baselineTask.scheduleId,
          taskName: baselineTask.taskName,
          plannedStart: baselineTask.plannedStart,
          plannedEnd: baselineTask.plannedEnd,
          plannedDuration: baselineTask.plannedDuration,
          actualStart: null,
          actualEnd: null,
          actualDuration: null,
          actualProgress: null,
          startVariance: null,
          endVariance: null,
          durationVariance: null,
          status: 'Task Deleted',
        };
      }

      // Calculate variance in days
      const startVariance = this.calculateDaysDifference(
        baselineTask.plannedStart,
        actualTask.startDate
      );
      const endVariance = this.calculateDaysDifference(
        baselineTask.plannedEnd,
        actualTask.endDate
      );
      const durationVariance = actualTask.duration - baselineTask.plannedDuration;

      // Determine status
      let status = 'On Track';
      if (endVariance > 7) {
        status = 'Major Delay';
      } else if (endVariance > 0) {
        status = 'Minor Delay';
      } else if (endVariance < 0) {
        status = 'Ahead';
      }

      return {
        taskId: actualTask.id,
        taskName: actualTask.taskName,
        plannedStart: baselineTask.plannedStart,
        plannedEnd: baselineTask.plannedEnd,
        plannedDuration: baselineTask.plannedDuration,
        actualStart: actualTask.startDate,
        actualEnd: actualTask.endDate,
        actualDuration: actualTask.duration,
        actualProgress: actualTask.progress,
        startVariance,
        endVariance,
        durationVariance,
        status,
      };
    });

    // Calculate summary
    const onTrackCount = varianceReport.filter(
      (r) => r.status === 'On Track' || r.status === 'Ahead'
    ).length;
    const delayedCount = varianceReport.filter(
      (r) => r.status === 'Minor Delay' || r.status === 'Major Delay'
    ).length;
    const totalTasks = varianceReport.length;
    const avgDelay =
      varianceReport.reduce((sum, r) => sum + (r.endVariance || 0), 0) /
      totalTasks;

    return {
      baseline: {
        id: baseline.id,
        name: baseline.name,
        baselineDate: baseline.baselineDate,
      },
      summary: {
        totalTasks,
        onTrackCount,
        delayedCount,
        onTrackPercentage: (onTrackCount / totalTasks) * 100,
        delayedPercentage: (delayedCount / totalTasks) * 100,
        avgDelay: Math.round(avgDelay * 10) / 10,
      },
      tasks: varianceReport,
    };
  }

  private calculateDaysDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // ========== REPORT METHODS ==========

  async getCriticalPathReport(projectId: string) {
    const tasks = await this.prisma.schedule.findMany({
      where: { projectId },
      include: { wbs: true },
      orderBy: { startDate: 'asc' },
    });

    const criticalTasks = tasks.filter((t) => t.isCritical);
    const nonCriticalTasks = tasks.filter((t) => !t.isCritical);

    // Calculate total critical path duration
    const totalDuration = criticalTasks.reduce(
      (sum, task) => sum + task.duration,
      0
    );

    // Calculate earliest and latest dates
    const criticalStart = criticalTasks.length > 0
      ? criticalTasks[0].startDate
      : null;
    const criticalEnd = criticalTasks.length > 0
      ? criticalTasks[criticalTasks.length - 1].endDate
      : null;

    return {
      criticalTasks: criticalTasks.map((t) => ({
        id: t.id,
        taskName: t.taskName,
        startDate: t.startDate,
        endDate: t.endDate,
        duration: t.duration,
        progress: t.progress,
        wbsCode: t.wbs?.code || null,
        predecessors: t.predecessors,
      })),
      summary: {
        totalTasks: tasks.length,
        criticalTasksCount: criticalTasks.length,
        nonCriticalTasksCount: nonCriticalTasks.length,
        totalDuration,
        criticalPathStart: criticalStart,
        criticalPathEnd: criticalEnd,
        riskLevel: criticalTasks.length / tasks.length > 0.5 ? 'High' : 'Medium',
      },
    };
  }

  async getPerformanceReport(projectId: string) {
    const tasks = await this.prisma.schedule.findMany({
      where: { projectId },
      include: { wbs: true },
    });

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!tasks.length || !project) {
      return {
        summary: { spi: 1, scheduleVariance: 0 },
        tasks: [],
        status: {},
      };
    }

    const today = new Date();

    // Calculate schedule performance metrics
    let earnedValue = 0;
    let plannedValue = 0;
    let totalValue = 0;

    const statusCounts = {
      notStarted: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    };

    tasks.forEach((task) => {
      const taskValue = task.duration;
      totalValue += taskValue;

      // Earned Value = Progress * Task Value
      earnedValue += (Number(task.progress) / 100) * taskValue;

      // Planned Value = Planned progress by today
      const plannedProgress = this.calculatePlannedProgress(
        task.startDate,
        task.endDate,
        today
      );
      plannedValue += (plannedProgress / 100) * taskValue;

      // Status counts
      if (Number(task.progress) === 0) {
        statusCounts.notStarted++;
      } else if (Number(task.progress) === 100) {
        statusCounts.completed++;
      } else {
        statusCounts.inProgress++;
      }

      // Overdue check
      if (Number(task.progress) < 100 && new Date(task.endDate) < today) {
        statusCounts.overdue++;
      }
    });

    const spi = plannedValue > 0 ? earnedValue / plannedValue : 1;
    const scheduleVariance = earnedValue - plannedValue;
    const overallProgress = (earnedValue / totalValue) * 100;
    const plannedOverallProgress = (plannedValue / totalValue) * 100;

    return {
      summary: {
        spi: Math.round(spi * 100) / 100,
        scheduleVariance: Math.round(scheduleVariance * 10) / 10,
        earnedValue: Math.round(earnedValue * 10) / 10,
        plannedValue: Math.round(plannedValue * 10) / 10,
        overallProgress: Math.round(overallProgress * 10) / 10,
        plannedProgress: Math.round(plannedOverallProgress * 10) / 10,
        progressVariance: Math.round((overallProgress - plannedOverallProgress) * 10) / 10,
        status: spi >= 1 ? 'On Track' : spi >= 0.9 ? 'At Risk' : 'Behind',
      },
      status: statusCounts,
      dates: {
        projectStart: project.startDate,
        projectEnd: project.endDate,
        currentDate: today,
      },
    };
  }

  async getCompletionReport(projectId: string) {
    const tasks = await this.prisma.schedule.findMany({
      where: { projectId },
      include: { wbs: true },
      orderBy: { startDate: 'asc' },
    });

    const completed = tasks.filter((t) => Number(t.progress) === 100);
    const inProgress = tasks.filter(
      (t) => Number(t.progress) > 0 && Number(t.progress) < 100
    );
    const notStarted = tasks.filter((t) => Number(t.progress) === 0);

    const today = new Date();
    const overdue = tasks.filter(
      (t) => Number(t.progress) < 100 && new Date(t.endDate) < today
    );

    // Calculate completion rate
    const completionRate = tasks.length > 0
      ? (completed.length / tasks.length) * 100
      : 0;

    // Calculate average completion time
    const avgDuration =
      completed.length > 0
        ? completed.reduce((sum, t) => sum + t.duration, 0) / completed.length
        : 0;

    // Upcoming tasks (next 7, 14, 30 days)
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);
    const next14Days = new Date(today);
    next14Days.setDate(next14Days.getDate() + 14);
    const next30Days = new Date(today);
    next30Days.setDate(next30Days.getDate() + 30);

    const upcomingTasks = {
      next7Days: tasks.filter(
        (t) => new Date(t.endDate) <= next7Days && Number(t.progress) < 100
      ).length,
      next14Days: tasks.filter(
        (t) => new Date(t.endDate) <= next14Days && Number(t.progress) < 100
      ).length,
      next30Days: tasks.filter(
        (t) => new Date(t.endDate) <= next30Days && Number(t.progress) < 100
      ).length,
    };

    // Group by WBS
    const wbsGroups = new Map();
    tasks.forEach((task) => {
      const wbsCode = task.wbs?.code || 'No WBS';
      if (!wbsGroups.has(wbsCode)) {
        wbsGroups.set(wbsCode, {
          wbsCode,
          wbsName: task.wbs?.name || 'No WBS',
          total: 0,
          completed: 0,
        });
      }
      const group = wbsGroups.get(wbsCode);
      group.total++;
      if (Number(task.progress) === 100) group.completed++;
    });

    const wbsData = Array.from(wbsGroups.values()).map((group) => ({
      ...group,
      completionRate: (group.completed / group.total) * 100,
    }));

    return {
      summary: {
        total: tasks.length,
        completed: completed.length,
        inProgress: inProgress.length,
        notStarted: notStarted.length,
        overdue: overdue.length,
        completionRate: Math.round(completionRate * 10) / 10,
        avgDuration: Math.round(avgDuration * 10) / 10,
      },
      upcomingTasks,
      wbsData,
    };
  }

  async getScheduleSummary(projectId: string) {
    const [tasks, milestones, baselines, project] = await Promise.all([
      this.prisma.schedule.findMany({ where: { projectId } }),
      this.prisma.milestone.findMany({ where: { projectId } }),
      this.prisma.scheduleBaseline.findMany({ where: { projectId } }),
      this.prisma.project.findUnique({ where: { id: projectId } }),
    ]);

    const criticalTasks = tasks.filter((t) => t.isCritical);
    const completed = tasks.filter((t) => Number(t.progress) === 100);
    const inProgress = tasks.filter(
      (t) => Number(t.progress) > 0 && Number(t.progress) < 100
    );
    const notStarted = tasks.filter((t) => Number(t.progress) === 0);

    const today = new Date();
    const overdue = tasks.filter(
      (t) => Number(t.progress) < 100 && new Date(t.endDate) < today
    );

    // Calculate schedule health score (0-100)
    let healthScore = 100;
    if (overdue.length > 0) healthScore -= overdue.length * 5;
    if (criticalTasks.length / tasks.length > 0.5) healthScore -= 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    const healthStatus =
      healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'At Risk' : 'Critical';

    return {
      tasks: {
        total: tasks.length,
        completed: completed.length,
        inProgress: inProgress.length,
        notStarted: notStarted.length,
        overdue: overdue.length,
        critical: criticalTasks.length,
      },
      milestones: {
        total: milestones.length,
        achieved: milestones.filter((m) => m.status === 'Achieved').length,
        pending: milestones.filter((m) => m.status === 'Pending').length,
        delayed: milestones.filter((m) => m.status === 'Delayed').length,
      },
      baselines: {
        total: baselines.length,
        active: baselines.find((b) => b.isActive)?.name || 'None',
      },
      health: {
        score: healthScore,
        status: healthStatus,
        color: healthStatus === 'Healthy' ? 'green' : healthStatus === 'At Risk' ? 'yellow' : 'red',
      },
      dates: {
        projectStart: project?.startDate || null,
        projectEnd: project?.endDate || null,
        today,
      },
    };
  }

  private calculatePlannedProgress(
    startDate: Date,
    endDate: Date,
    currentDate: Date
  ): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const current = new Date(currentDate).getTime();

    if (current <= start) return 0;
    if (current >= end) return 100;

    const totalDuration = end - start;
    const elapsed = current - start;

    return (elapsed / totalDuration) * 100;
  }
}
