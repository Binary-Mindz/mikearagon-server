import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyTokenTypeDto {
  @ApiProperty({ example: 'token' })
  @IsString()
  type!: 'token' | 'otp';
}
