import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ClientOrderService } from './services/client-order.service';
import { DriverOrderService } from './services/driver-order.service';
import { AdminOrderService } from './services/admin-order.service';

@Module({
  controllers: [OrderController],
  providers: [ClientOrderService, DriverOrderService, AdminOrderService],
})
export class OrderModule {}
