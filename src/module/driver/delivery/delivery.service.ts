import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyRouteOrders(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      select: { state: true },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    const grouped = await this.prisma.order.groupBy({
      by: ['clientId'],
      where: {
        status: OrderStatus.CREATED,
        currentDriverId: null,
        pickupDetails: {
          state: driver.state,
        },
        clientId: {
          not: null, // ignore admin-only orders if needed
        },
      },
      _count: {
        id: true,
      },
    });

    const clientIds = grouped
      .map((g) => g.clientId)
      .filter((id): id is string => id !== null);

    if (!clientIds.length) {
      return ApiResponse.success('Orders fetched successfully', []);
    }

    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: clientIds },
      },
    });

    const result = grouped.map((g) => {
      const client = clients.find((c) => c.id === g.clientId);

      return {
        clientId: g.clientId,
        companyName: client?.companyName,
        companyLogo: client?.companyLogo,
        totalOrders: g._count.id,
        address: `${client?.suiteNumber}, ${client?.companyAddress}, ${client?.city}, ${client?.state} ${client?.zip}`,
      };
    });

    return ApiResponse.success('Orders fetched successfully', result);
  }
}
