import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty() contactName!: string;
  @ApiProperty() email!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() companyName!: string;
  @ApiProperty() companyAddress!: string;
  @ApiProperty() suiteNumber!: string;
  @ApiProperty() city!: string;
  @ApiProperty() state!: string;
  @ApiProperty() zipCode!: string;
}

export class CreateOrderDto {
  @ApiProperty({ enum: ['DELIVERY', 'PICKUP'] })
  type!: 'DELIVERY' | 'PICKUP';

  @ApiProperty()
  itemId!: string;

  @ApiProperty({ required: false })
  specialNote?: string;

  @ApiProperty({ type: AddressDto })
  pickupDetails!: AddressDto;

  @ApiProperty({ type: AddressDto })
  deliveryDetails!: AddressDto;
}
