import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WbsService } from './wbs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wbs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wbs')
export class WbsController {
  constructor(private readonly wbsService: WbsService) {}

  @Post()
  @ApiOperation({ summary: 'Create WBS item' })
  create(@Body() createWbsDto: any) {
    const { projectId, ...data } = createWbsDto;
    return this.wbsService.create(projectId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all WBS items for a project' })
  findAll(@Query('projectId') projectId: string) {
    return this.wbsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get WBS item by ID' })
  findOne(@Param('id') id: string) {
    return this.wbsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update WBS item' })
  update(@Param('id') id: string, @Body() updateWbsDto: any) {
    return this.wbsService.update(id, updateWbsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete WBS item' })
  remove(@Param('id') id: string) {
    return this.wbsService.remove(id);
  }
}
