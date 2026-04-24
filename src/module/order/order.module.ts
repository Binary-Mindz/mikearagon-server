import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './services/client-order.service';
import { DriverOrderService } from './services/driver-order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, DriverOrderService],
})
export class OrderModule {}
