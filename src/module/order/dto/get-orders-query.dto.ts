import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum DateFilter {
  LAST_3_DAYS = 'last_3_days',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
}

export class GetOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Search by order ID or package type',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter orders by status',
    enum: OrderStatus,
    example: OrderStatus.CREATED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: DateFilter,
    description: 'Filter orders by date range',
    example: DateFilter.LAST_7_DAYS,
  })
  @IsOptional()
  @IsEnum(DateFilter)
  dateFilter?: DateFilter;
}
