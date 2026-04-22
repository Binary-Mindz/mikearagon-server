import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentClient } from 'src/common/decorators/get-client.decorator';
import { ProfileGuard } from 'src/common/guards/profile.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create order' })
  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.createOrder(createOrderDto, clientId);
  }

  @ApiOperation({ summary: 'Get my orders list as client' })
  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Get('client/my')
  getMyOrders(@CurrentClient('id') clientId: string) {
    return this.orderService.getMyOrders(clientId);
  }

  @ApiOperation({ summary: 'Get my order details as client' })
  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Get('client/my/:id')
  getMyOrderDetails(
    @Param('id') id: string,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.getMyOrderDetails(id, clientId);
  }

  @ApiOperation({ summary: 'Update order' })
  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Patch(':id')
  updateOrder(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.updateOrder(orderId, updateOrderDto, clientId);
  }
}
