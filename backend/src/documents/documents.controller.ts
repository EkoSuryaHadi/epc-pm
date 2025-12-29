import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload document with file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/documents';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const basename = path.basename(file.originalname, ext);
          cb(null, `${basename}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/zip',
          'text/plain',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
    @Request() req,
  ) {
    return this.documentsService.uploadFile(file, metadata, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create document metadata only' })
  create(@Body() createDocumentDto: any, @Request() req) {
    const { projectId, ...data } = createDocumentDto;
    return this.documentsService.create(projectId, data, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for a project' })
  findAll(
    @Query('projectId') projectId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('discipline') discipline?: string,
  ) {
    return this.documentsService.findAll(projectId, { category, status, discipline });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  update(@Param('id') id: string, @Body() updateDocumentDto: any) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document file' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const document = await this.documentsService.findOne(id);
    
    if (!document || !document.filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    const filename = path.basename(document.filePath);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.title}${path.extname(filename)}"`);
    
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to document' })
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.documentsService.addComment(id, req.user.id, body.content);
  }
}
