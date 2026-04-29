import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { OrderAddressDto } from './order-address.dto';

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type!: OrderType;

  @ApiProperty({
    example: '1234567890',
  })
  @IsString()
  itemId!: string;

  @ApiProperty({ required: false, example: 'Special Note' })
  @IsString()
  specialNote?: string;

  @ApiProperty({ type: OrderAddressDto })
  @ValidateNested()
  @Type(() => OrderAddressDto)
  pickupDetails!: OrderAddressDto;

  @ApiProperty({ type: OrderAddressDto })
  @ValidateNested()
  @Type(() => OrderAddressDto)
  deliveryDetails!: OrderAddressDto;
}
