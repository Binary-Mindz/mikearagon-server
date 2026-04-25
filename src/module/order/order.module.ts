import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ClientOrderService } from './services/client-order.service';
import { DriverOrderService } from './services/driver-order.service';

@Module({
  controllers: [OrderController],
  providers: [ClientOrderService, DriverOrderService],
})
export class OrderModule {}
