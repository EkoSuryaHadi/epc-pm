import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'clxxxxxxxx' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    example: 'PROJECT_MANAGER',
    enum: ['ADMIN', 'PROJECT_MANAGER', 'PROJECT_CONTROL_ENGINEER', 'PLANNING_ENGINEER', 'COST_ENGINEER', 'DOCUMENT_CONTROLLER', 'DISCIPLINE_ENGINEER', 'CLIENT', 'EXECUTIVE']
  })
  @IsEnum(['ADMIN', 'PROJECT_MANAGER', 'PROJECT_CONTROL_ENGINEER', 'PLANNING_ENGINEER', 'COST_ENGINEER', 'DOCUMENT_CONTROLLER', 'DISCIPLINE_ENGINEER', 'CLIENT', 'EXECUTIVE'])
  @IsNotEmpty()
  role: string;
}
