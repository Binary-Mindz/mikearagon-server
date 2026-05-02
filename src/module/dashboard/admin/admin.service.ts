import { Injectable } from '@nestjs/common';
import { OrderType, Prisma } from '@prisma/client';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalOrders, deliveryOrders, pickupOrders, totalUsers] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({
          where: {
            type: OrderType.DELIVERY,
          },
        }),
        this.prisma.order.count({
          where: {
            type: OrderType.PICKUP,
          },
        }),
        this.prisma.client.count(),
      ]);

    return ApiResponse.success('Stats fetched successfully', {
      totalOrders,
      deliveryOrders,
      pickupOrders,
      totalUsers,
    });
  }

  async getAnalytics(
    filter: 'daily' | 'weekly' | 'monthly',
    ordersSelection: 'admin' | 'all',
    adminId: string,
  ) {
    let data;

    if (filter === 'daily') {
      const whereClause =
        ordersSelection === 'admin'
          ? Prisma.sql`WHERE "createdById" = ${adminId} AND "createdAt" >= NOW() - INTERVAL '7 days'`
          : Prisma.sql`WHERE "createdAt" >= NOW() - INTERVAL '7 days'`;

      data = await this.prisma.$queryRaw`
          SELECT
            TO_CHAR("createdAt", 'Dy') as label,
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
          FROM "Order"
          ${whereClause}
          GROUP BY TO_CHAR("createdAt", 'Dy'), DATE("createdAt")
          ORDER BY MIN("createdAt")
        `;
    } else if (filter === 'weekly') {
      const whereClause =
        ordersSelection === 'admin'
          ? Prisma.sql`WHERE "createdById" = ${adminId} AND "createdAt" >= NOW() - INTERVAL '12 weeks'`
          : Prisma.sql`WHERE "createdAt" >= NOW() - INTERVAL '12 weeks'`;

      data = await this.prisma.$queryRaw`
          SELECT
            'Week ' || TO_CHAR(DATE_TRUNC('week', "createdAt"), 'WW') as label,
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
          FROM "Order"
          ${whereClause}
          GROUP BY DATE_TRUNC('week', "createdAt")
          ORDER BY MIN("createdAt")
        `;
    } else if (filter === 'monthly') {
      const whereClause =
        ordersSelection === 'admin'
          ? Prisma.sql`WHERE "createdById" = ${adminId} AND "createdAt" >= NOW() - INTERVAL '12 months'`
          : Prisma.sql`WHERE "createdAt" >= NOW() - INTERVAL '12 months'`;

      data = await this.prisma.$queryRaw`
          SELECT
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as label,
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
          FROM "Order"
          ${whereClause}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY MIN("createdAt")
        `;
    }

    return ApiResponse.success('Analytics fetched successfully', data);
  }
}
