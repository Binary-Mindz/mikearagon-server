import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class DriverRegisterDto {
  @ApiProperty({
    example: 'John Doe',
    required: true,
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: 'example@email.com',
    required: true,
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: '12345678',
    required: true,
  })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({
    example: 'www.example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImg?: string;

  @ApiProperty({
    example: '12 Main St',
    required: true,
  })
  @IsString()
  address!: string;

  @ApiProperty({
    example: 'New York',
    required: true,
  })
  @IsString()
  state!: string;

  @ApiProperty({
    example: 'New York',
    required: true,
  })
  @IsString()
  city!: string;

  @ApiProperty({
    example: '12345',
    required: true,
  })
  @IsString()
  zip!: string;

  @ApiProperty({
    enum: DriverStatus,
    required: true,
  })
  @IsEnum(DriverStatus)
  status!: DriverStatus;
}
