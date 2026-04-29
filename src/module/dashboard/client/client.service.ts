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

  async getAnalytics(clientId: string, filter: 'daily' | 'weekly' | 'monthly') {
    let data;

    if (filter === 'daily') {
      data = await this.prisma.$queryRaw`
        SELECT
          TO_CHAR("createdAt", 'Dy') as label,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
        FROM "Order"
        WHERE "clientId" = ${clientId} AND "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY TO_CHAR("createdAt", 'Dy'), DATE("createdAt")
        ORDER BY MIN("createdAt")
      `;
    } else if (filter === 'weekly') {
      data = await this.prisma.$queryRaw`
        SELECT
          'Week ' || TO_CHAR(DATE_TRUNC('week', "createdAt"), 'WW') as label,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
        FROM "Order"
        WHERE "clientId" = ${clientId} AND "createdAt" >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', "createdAt")
        ORDER BY MIN("createdAt")
      `;
    } else if (filter === 'monthly') {
      data = await this.prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as label,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
        FROM "Order"
        WHERE "clientId" = ${clientId} AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY MIN("createdAt")
      `;
    }

    return ApiResponse.success('Analytics fetched successfully', data);
  }
}
