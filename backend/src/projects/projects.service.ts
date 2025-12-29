import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.project.create({
      data: {
        ...data,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'PROJECT_MANAGER',
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
  }

  async findAll(userId?: string) {
    const where = userId
      ? {
          members: {
            some: { userId },
          },
        }
      : {};

    return this.prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            members: true,
            wbs: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
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
  }

  async update(id: string, data: any) {
    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async addMember(projectId: string, userId: string, role: UserRole) {
    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }
}
