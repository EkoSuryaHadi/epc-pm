import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RisksService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, data: any) {
    const riskScore = data.probability * data.impact;
    
    return this.prisma.risk.create({
      data: {
        ...data,
        projectId,
        riskScore,
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.risk.findMany({
      where: { projectId },
      orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.risk.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    if (data.probability && data.impact) {
      data.riskScore = data.probability * data.impact;
    }

    return this.prisma.risk.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.risk.delete({ where: { id } });
  }

  async getRiskMatrix(projectId: string) {
    const risks = await this.prisma.risk.findMany({
      where: { projectId },
    });

    const matrix = {
      critical: risks.filter(r => r.riskScore >= 15).length,
      high: risks.filter(r => r.riskScore >= 9 && r.riskScore < 15).length,
      medium: risks.filter(r => r.riskScore >= 5 && r.riskScore < 9).length,
      low: risks.filter(r => r.riskScore < 5).length,
      total: risks.length,
      openRisks: risks.filter(r => r.status === 'Open').length,
    };

    return matrix;
  }

  async createChangeOrder(projectId: string, data: any) {
    return this.prisma.changeOrder.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async getChangeOrders(projectId: string) {
    return this.prisma.changeOrder.findMany({
      where: { projectId },
      orderBy: { requestDate: 'desc' },
    });
  }
}
