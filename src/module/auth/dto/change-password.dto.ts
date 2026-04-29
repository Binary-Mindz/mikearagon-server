import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  password!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  newPassword!: string;
}
