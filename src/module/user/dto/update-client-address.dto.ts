import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClientAddressDto {
  @ApiPropertyOptional({
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({
    example: 'Nevada',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: 'Las Vegas',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: '12345',
  })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({
    example: 'Apt 123',
  })
  @IsOptional()
  @IsString()
  suiteNumber?: string;
}
