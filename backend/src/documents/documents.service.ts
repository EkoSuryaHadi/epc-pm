import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, metadata: any, userId: string) {
    const documentData = {
      projectId: metadata.projectId,
      documentNo: metadata.documentNo,
      title: metadata.title,
      description: metadata.description || null,
      category: metadata.category,
      discipline: metadata.discipline || null,
      revision: metadata.revision || 'A',
      status: metadata.status || 'DRAFT',
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedById: userId,
    };

    return this.prisma.document.create({
      data: documentData,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async create(projectId: string, data: any, userId: string) {
    return this.prisma.document.create({
      data: {
        ...data,
        projectId,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(projectId: string, filters?: any) {
    const where: any = { projectId };

    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.discipline) {
      where.discipline = filters.discipline;
    }

    return this.prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    
    if (document && document.filePath) {
      try {
        if (fs.existsSync(document.filePath)) {
          fs.unlinkSync(document.filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    return this.prisma.document.delete({ where: { id } });
  }

  async addComment(documentId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        documentId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
