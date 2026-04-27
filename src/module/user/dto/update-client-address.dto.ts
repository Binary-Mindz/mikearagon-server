import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { USState } from 'src/common/enums/us-state.enum';

export class UpdateClientAddressDto {
  @ApiPropertyOptional({
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({ example: USState.NV })
  @IsEnum(USState, { message: 'Invalid US state' })
  state!: USState;

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
