import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { AdminOrderService } from './services/admin-order.service';
import { ClientOrderService } from './services/client-order.service';

@Module({
  controllers: [OrderController],
  providers: [ClientOrderService, AdminOrderService],
})
export class OrderModule {}
