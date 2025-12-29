import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RisksService } from './risks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('risks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Post()
  @ApiOperation({ summary: 'Create risk' })
  create(@Body() createRiskDto: any) {
    const { projectId, ...data } = createRiskDto;
    return this.risksService.create(projectId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all risks for a project' })
  findAll(@Query('projectId') projectId: string) {
    return this.risksService.findAll(projectId);
  }

  @Get('matrix/:projectId')
  @ApiOperation({ summary: 'Get risk matrix for a project' })
  getRiskMatrix(@Param('projectId') projectId: string) {
    return this.risksService.getRiskMatrix(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get risk by ID' })
  findOne(@Param('id') id: string) {
    return this.risksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update risk' })
  update(@Param('id') id: string, @Body() updateRiskDto: any) {
    return this.risksService.update(id, updateRiskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete risk' })
  remove(@Param('id') id: string) {
    return this.risksService.remove(id);
  }

  @Post('change-orders')
  @ApiOperation({ summary: 'Create change order' })
  createChangeOrder(@Body() createChangeOrderDto: any) {
    const { projectId, ...data } = createChangeOrderDto;
    return this.risksService.createChangeOrder(projectId, data);
  }

  @Get('change-orders/list')
  @ApiOperation({ summary: 'Get change orders for a project' })
  getChangeOrders(@Query('projectId') projectId: string) {
    return this.risksService.getChangeOrders(projectId);
  }
}
