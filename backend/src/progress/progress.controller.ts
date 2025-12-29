import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('updates')
  @ApiOperation({ summary: 'Create progress update' })
  createUpdate(@Body() createProgressDto: any, @Request() req) {
    const { projectId, ...data } = createProgressDto;
    return this.progressService.createUpdate(projectId, data, req.user.id);
  }

  @Get('updates')
  @ApiOperation({ summary: 'Get all progress updates for a project' })
  findAll(@Query('projectId') projectId: string) {
    return this.progressService.findAll(projectId);
  }

  @Get('updates/:id')
  @ApiOperation({ summary: 'Get a single progress update' })
  findOne(@Param('id') id: string) {
    return this.progressService.findOne(id);
  }

  @Patch('updates/:id')
  @ApiOperation({ summary: 'Update progress update' })
  updateUpdate(@Param('id') id: string, @Body() updateProgressDto: any) {
    return this.progressService.update(id, updateProgressDto);
  }

  @Delete('updates/:id')
  @ApiOperation({ summary: 'Delete progress update' })
  removeUpdate(@Param('id') id: string) {
    return this.progressService.remove(id);
  }

  @Get('summary/:projectId')
  @ApiOperation({ summary: 'Get progress summary for a project' })
  getProgressSummary(@Param('projectId') projectId: string) {
    return this.progressService.getProgressSummary(projectId);
  }

  @Get('evm/:projectId')
  @ApiOperation({ summary: 'Get Earned Value Management metrics' })
  getEVM(@Param('projectId') projectId: string) {
    return this.progressService.getEVM(projectId);
  }

  @Get('kpi/:projectId')
  @ApiOperation({ summary: 'Get KPI metrics' })
  getKPI(@Param('projectId') projectId: string) {
    return this.progressService.getKPI(projectId);
  }

  @Get('s-curve/:projectId')
  @ApiOperation({ summary: 'Get S-Curve data' })
  getSCurve(@Param('projectId') projectId: string) {
    return this.progressService.getSCurve(projectId);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Create progress report' })
  createReport(@Body() createReportDto: any) {
    const { projectId, ...data } = createReportDto;
    return this.progressService.createReport(projectId, data);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get progress reports for a project' })
  getReports(@Query('projectId') projectId: string) {
    return this.progressService.getReports(projectId);
  }
}
