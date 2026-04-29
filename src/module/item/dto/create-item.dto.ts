import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  name!: string;
}
