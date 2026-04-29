import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { USState } from 'src/common/enums/us-state.enum';

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

  @ApiProperty({ example: '12345678' })
  @IsString()
  password!: string;

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

  @ApiProperty({ example: USState.NV })
  @IsEnum(USState, { message: 'Invalid US state' })
  state!: USState;

  @ApiProperty({ example: '12345' })
  @IsString()
  zip!: string;

  @ApiProperty({ example: 'IT' })
  @IsString()
  industry!: string;
}
