import { Injectable } from '@nestjs/common';
import { OrderType } from '@prisma/client';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(clientId: string) {
    const [totalOrders, deliveryOrders, pickupOrders] = await Promise.all([
      this.prisma.order.count({
        where: { clientId },
      }),
      this.prisma.order.count({
        where: {
          clientId,
          type: OrderType.DELIVERY,
        },
      }),
      this.prisma.order.count({
        where: {
          clientId,
          type: OrderType.PICKUP,
        },
      }),
    ]);

    return ApiResponse.success('Stats fetched successfully', {
      totalOrders,
      deliveryOrders,
      pickupOrders,
    });
  }
}
