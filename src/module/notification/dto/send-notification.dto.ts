/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export interface SendNotification {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  orderId?: string;
}

export class SendNotificationDto implements SendNotification {
  @ApiProperty({
    example: 'example-user-id',
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    example: 'Order placed',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Your order has been placed',
  })
  @IsString()
  message!: string;

  @ApiProperty({
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({
    example: 'example-order-id',
  })
  @IsOptional()
  @IsString()
  orderId?: string;
}
