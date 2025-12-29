import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @ApiProperty({ example: 'Oil & Gas Processing Plant' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated project description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'LOC-002' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 6000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalBudget?: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
