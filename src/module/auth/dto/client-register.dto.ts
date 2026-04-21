import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ClientRegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'example@email.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'Example Company' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  companyAddress!: string;

  @ApiProperty({ example: 'Apt 123' })
  @IsString()
  suiteNumber!: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state!: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  zip!: string;

  @ApiProperty({ example: 'IT' })
  @IsString()
  industry!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  password!: string;
}
