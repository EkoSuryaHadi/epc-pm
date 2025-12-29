import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@epc.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
  )
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ 
    example: 'PROJECT_MANAGER',
    enum: ['ADMIN', 'PROJECT_MANAGER', 'PROJECT_CONTROL_ENGINEER', 'PLANNING_ENGINEER', 'COST_ENGINEER', 'DOCUMENT_CONTROLLER', 'DISCIPLINE_ENGINEER', 'CLIENT', 'EXECUTIVE']
  })
  @IsEnum(['ADMIN', 'PROJECT_MANAGER', 'PROJECT_CONTROL_ENGINEER', 'PLANNING_ENGINEER', 'COST_ENGINEER', 'DOCUMENT_CONTROLLER', 'DISCIPLINE_ENGINEER', 'CLIENT', 'EXECUTIVE'], {
    message: 'Invalid role'
  })
  @IsNotEmpty({ message: 'Role is required' })
  role: string;
}
