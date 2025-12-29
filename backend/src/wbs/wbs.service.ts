import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WbsService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, data: any) {
    const wbsItem = await this.prisma.wBS.create({
      data: {
        ...data,
        projectId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    // Transform Decimal to Number
    return {
      ...wbsItem,
      weightage: Number(wbsItem.weightage),
      parent: wbsItem.parent ? {
        ...wbsItem.parent,
        weightage: Number(wbsItem.parent.weightage),
      } : null,
      children: wbsItem.children.map(child => ({
        ...child,
        weightage: Number(child.weightage),
      })),
    };
  }

  async findAll(projectId: string) {
    const wbsItems = await this.prisma.wBS.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            costCodes: true,
            schedules: true,
          },
        },
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });

    // Return flat array without parent/children included
    // Frontend will build the tree structure using buildWBSTree()
    return wbsItems.map(item => ({
      ...item,
      weightage: Number(item.weightage),
    }));
  }

  async findOne(id: string) {
    const wbsItem = await this.prisma.wBS.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        costCodes: true,
        schedules: true,
      },
    });

    if (!wbsItem) return null;

    // Transform Decimal to Number
    return {
      ...wbsItem,
      weightage: Number(wbsItem.weightage),
      parent: wbsItem.parent ? {
        ...wbsItem.parent,
        weightage: Number(wbsItem.parent.weightage),
      } : null,
      children: wbsItem.children.map(child => ({
        ...child,
        weightage: Number(child.weightage),
      })),
    };
  }

  async update(id: string, data: any) {
    const wbsItem = await this.prisma.wBS.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    // Transform Decimal to Number
    return {
      ...wbsItem,
      weightage: Number(wbsItem.weightage),
      parent: wbsItem.parent ? {
        ...wbsItem.parent,
        weightage: Number(wbsItem.parent.weightage),
      } : null,
      children: wbsItem.children.map(child => ({
        ...child,
        weightage: Number(child.weightage),
      })),
    };
  }

  async remove(id: string) {
    return this.prisma.wBS.delete({ where: { id } });
  }
}
