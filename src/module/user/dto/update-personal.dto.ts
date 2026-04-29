import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePersonalInfoDto {
  @ApiPropertyOptional({
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
