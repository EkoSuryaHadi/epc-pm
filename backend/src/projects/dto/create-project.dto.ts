import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'PRJ-2024-001', description: 'Unique project code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Oil & Gas Processing Plant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Offshore processing facility construction project' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'LOC-001' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'PT Pertamina', required: false })
  @IsString()
  @IsOptional()
  client?: string;

  @ApiProperty({ example: 'PT Contractor Indonesia', required: false })
  @IsString()
  @IsOptional()
  contractor?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.PLANNING,
    default: ProjectStatus.PLANNING,
    required: false
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ example: 5000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalBudget: number;

  @ApiProperty({ example: 'USD', default: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
