import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderAddressDto } from './order-address.dto';

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderType, required: false })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiProperty({
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiProperty({ required: false, example: 'Special Note' })
  @IsOptional()
  @IsString()
  specialNote?: string;

  @ApiProperty({ type: OrderAddressDto, required: false })
  @IsOptional()
  pickupDetails?: OrderAddressDto;

  @ApiProperty({ type: OrderAddressDto, required: false })
  @IsOptional()
  deliveryDetails?: OrderAddressDto;
}
