import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CostService } from './cost.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cost')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Post('codes')
  @ApiOperation({ summary: 'Create cost code' })
  createCostCode(@Body() createCostCodeDto: any) {
    const { projectId, ...data } = createCostCodeDto;
    return this.costService.createCostCode(projectId, data);
  }

  @Get('codes')
  @ApiOperation({ summary: 'Get all cost codes for a project' })
  findAllCostCodes(@Query('projectId') projectId: string) {
    return this.costService.findAllCostCodes(projectId);
  }

  @Patch('codes/:id')
  @ApiOperation({ summary: 'Update cost code' })
  updateCostCode(@Param('id') id: string, @Body() updateCostCodeDto: any) {
    return this.costService.updateCostCode(id, updateCostCodeDto);
  }

  @Delete('codes/:id')
  @ApiOperation({ summary: 'Delete cost code' })
  deleteCostCode(@Param('id') id: string) {
    return this.costService.deleteCostCode(id);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Create cost entry' })
  createCostEntry(@Body() createCostEntryDto: any, @Request() req) {
    const { projectId, ...data } = createCostEntryDto;
    return this.costService.createCostEntry(projectId, data, req.user.id);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get all cost entries for a project' })
  findAllCostEntries(@Query('projectId') projectId: string) {
    return this.costService.findAllCostEntries(projectId);
  }

  @Get('summary/:projectId')
  @ApiOperation({ summary: 'Get cost summary for a project' })
  getCostSummary(@Param('projectId') projectId: string) {
    return this.costService.getCostSummary(projectId);
  }
}
