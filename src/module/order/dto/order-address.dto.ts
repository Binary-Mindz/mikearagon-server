import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OrderAddressDto {
  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  contactName!: string;

  @ApiProperty({
    example: 'example@email',
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: '1234567890',
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    example: 'Example Company',
  })
  @IsString()
  companyName!: string;

  @ApiProperty({
    example: '123 Main St',
  })
  @IsString()
  companyAddress!: string;

  @ApiProperty({
    example: 'Apt 123',
  })
  @IsString()
  suiteNumber!: string;

  @ApiProperty({
    example: 'New York',
  })
  @IsString()
  city!: string;

  @ApiProperty({
    example: 'NY',
  })
  @IsString()
  state!: string;

  @ApiProperty({
    example: '12345',
  })
  @IsString()
  zipCode!: string;
}
