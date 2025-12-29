import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CostService {
  constructor(private prisma: PrismaService) {}

  async createCostCode(projectId: string, data: any) {
    return this.prisma.costCode.create({
      data: {
        ...data,
        projectId,
      },
      include: {
        wbs: true,
      },
    });
  }

  async findAllCostCodes(projectId: string) {
    return this.prisma.costCode.findMany({
      where: { projectId },
      include: {
        wbs: true,
        _count: {
          select: { costEntries: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async updateCostCode(id: string, data: any) {
    return this.prisma.costCode.update({
      where: { id },
      data,
      include: {
        wbs: true,
        _count: {
          select: { costEntries: true },
        },
      },
    });
  }

  async deleteCostCode(id: string) {
    return this.prisma.costCode.delete({
      where: { id },
    });
  }

  async createCostEntry(projectId: string, data: any, userId: string) {
    return this.prisma.costEntry.create({
      data: {
        ...data,
        projectId,
        createdById: userId,
      },
      include: {
        costCode: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAllCostEntries(projectId: string) {
    return this.prisma.costEntry.findMany({
      where: { projectId },
      include: {
        costCode: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { entryDate: 'desc' },
    });
  }

  async getCostSummary(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { totalBudget: true },
    });

    const costCodes = await this.prisma.costCode.findMany({
      where: { projectId },
      include: {
        costEntries: true,
      },
    });

    const totalBudget = project.totalBudget;
    const totalActual = costCodes.reduce((sum, code) => {
      const codeActual = code.costEntries.reduce((s, entry) => s + Number(entry.amount), 0);
      return sum + codeActual;
    }, 0);

    const variance = Number(totalBudget) - totalActual;
    const variancePercent = (variance / Number(totalBudget)) * 100;

    return {
      totalBudget: Number(totalBudget),
      totalActual,
      variance,
      variancePercent,
      costCodes: costCodes.map(code => {
        const actual = code.costEntries.reduce((s, entry) => s + Number(entry.amount), 0);
        return {
          code: code.code,
          name: code.name,
          budget: Number(code.budget),
          actual,
          variance: Number(code.budget) - actual,
        };
      }),
    };
  }
}
