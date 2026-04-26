import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
    required: true,
  })
  @IsString()
  token!: string;

  @ApiProperty({
    example: '12345678',
    required: true,
  })
  @IsString()
  newPassword!: string;
}
