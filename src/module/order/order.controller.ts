import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentClient } from 'src/common/decorators/get-client.decorator';
import { ProfileGuard } from 'src/common/guards/profile.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard, ProfileGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.createOrder(createOrderDto, clientId);
  }
}
