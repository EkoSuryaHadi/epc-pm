import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create schedule task' })
  create(@Body() createScheduleDto: any) {
    const { projectId, ...data } = createScheduleDto;
    return this.scheduleService.create(projectId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedule tasks for a project' })
  findAll(@Query('projectId') projectId: string) {
    return this.scheduleService.findAll(projectId);
  }

  @Get('milestones')
  @ApiOperation({ summary: 'Get project milestones' })
  getMilestones(@Query('projectId') projectId: string) {
    return this.scheduleService.getMilestones(projectId);
  }

  @Post('milestones')
  @ApiOperation({ summary: 'Create milestone' })
  createMilestone(@Body() createMilestoneDto: any) {
    const { projectId, ...data } = createMilestoneDto;
    return this.scheduleService.createMilestone(projectId, data);
  }

  @Patch('milestones/:id')
  @ApiOperation({ summary: 'Update milestone' })
  updateMilestone(@Param('id') id: string, @Body() updateMilestoneDto: any) {
    return this.scheduleService.updateMilestone(id, updateMilestoneDto);
  }

  @Delete('milestones/:id')
  @ApiOperation({ summary: 'Delete milestone' })
  deleteMilestone(@Param('id') id: string) {
    return this.scheduleService.deleteMilestone(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule task by ID' })
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule task' })
  update(@Param('id') id: string, @Body() updateScheduleDto: any) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete schedule task' })
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

  // ========== BASELINE ENDPOINTS ==========

  @Get('baselines')
  @ApiOperation({ summary: 'Get all baselines for a project' })
  getBaselines(@Query('projectId') projectId: string) {
    return this.scheduleService.getBaselines(projectId);
  }

  @Get('baselines/:id')
  @ApiOperation({ summary: 'Get baseline by ID' })
  getBaseline(@Param('id') id: string) {
    return this.scheduleService.getBaseline(id);
  }

  @Post('baselines')
  @ApiOperation({ summary: 'Create baseline from current schedule' })
  createBaseline(@Body() createBaselineDto: any, @Request() req: any) {
    const { projectId, ...data } = createBaselineDto;
    const userId = req.user?.userId || 'system';
    return this.scheduleService.createBaseline(projectId, data, userId);
  }

  @Patch('baselines/:id')
  @ApiOperation({ summary: 'Update baseline (name, description)' })
  updateBaseline(@Param('id') id: string, @Body() updateBaselineDto: any) {
    return this.scheduleService.updateBaseline(id, updateBaselineDto);
  }

  @Delete('baselines/:id')
  @ApiOperation({ summary: 'Delete baseline' })
  deleteBaseline(@Param('id') id: string) {
    return this.scheduleService.deleteBaseline(id);
  }

  @Patch('baselines/:id/activate')
  @ApiOperation({ summary: 'Set baseline as active' })
  activateBaseline(@Param('id') id: string, @Body() body: any) {
    return this.scheduleService.activateBaseline(id, body.projectId);
  }

  @Get('baselines/:id/tasks')
  @ApiOperation({ summary: 'Get baseline tasks' })
  getBaselineTasks(@Param('id') id: string) {
    return this.scheduleService.getBaselineTasks(id);
  }

  @Get('baselines/:id/variance')
  @ApiOperation({ summary: 'Get variance report for baseline' })
  getVarianceReport(@Param('id') id: string) {
    return this.scheduleService.getVarianceReport(id);
  }

  // ========== REPORT ENDPOINTS ==========

  @Get('reports/critical-path')
  @ApiOperation({ summary: 'Get critical path report' })
  getCriticalPathReport(@Query('projectId') projectId: string) {
    return this.scheduleService.getCriticalPathReport(projectId);
  }

  @Get('reports/performance')
  @ApiOperation({ summary: 'Get schedule performance report' })
  getPerformanceReport(@Query('projectId') projectId: string) {
    return this.scheduleService.getPerformanceReport(projectId);
  }

  @Get('reports/completion')
  @ApiOperation({ summary: 'Get task completion report' })
  getCompletionReport(@Query('projectId') projectId: string) {
    return this.scheduleService.getCompletionReport(projectId);
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get schedule summary' })
  getScheduleSummary(@Query('projectId') projectId: string) {
    return this.scheduleService.getScheduleSummary(projectId);
  }
}
