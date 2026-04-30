import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemStatus } from '@prisma/client';
import { SearchPaginationDto } from 'src/common/dto/search-pagination.dto';
import { Role } from 'src/common/enums/role.enum';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class AdminOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, adminId: string) {
    const item = await this.prisma.item.findUnique({
      where: {
        id: dto.itemId,
      },
      select: {
        status: true,
      },
    });

    if (!item || item.status !== ItemStatus.ACTIVE) {
      throw new NotFoundException('Item not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          itemId: dto.itemId,
          type: dto.type,
          specialNote: dto.specialNote,
          createdById: adminId,
          createdByRole: Role.ADMIN,
        },
      });

      await tx.pickupDetails.create({
        data: {
          orderId: order.id,
          contactName: dto.pickupDetails.contactName,
          companyAddress: dto.pickupDetails.companyAddress,
          companyName: dto.pickupDetails.companyName,
          email: dto.pickupDetails.email,
          suiteNumber: dto.pickupDetails.suiteNumber,
          zipCode: dto.pickupDetails.zipCode,
          city: dto.pickupDetails.city,
          state: dto.pickupDetails.state,
          phone: dto.pickupDetails.phone,
        },
      });

      await tx.deliveryDetails.create({
        data: {
          orderId: order.id,
          contactName: dto.deliveryDetails.contactName,
          companyAddress: dto.deliveryDetails.companyAddress,
          companyName: dto.deliveryDetails.companyName,
          email: dto.deliveryDetails.email,
          suiteNumber: dto.deliveryDetails.suiteNumber,
          zipCode: dto.deliveryDetails.zipCode,
          city: dto.deliveryDetails.city,
          state: dto.deliveryDetails.state,
          phone: dto.deliveryDetails.phone,
        },
      });

      return ApiResponse.success('Order created successfully', order);
    });
  }

  async getOthersOrders(query: SearchPaginationDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    // Filter clients
    const filteredClients = await this.prisma.client.findMany({
      where: {
        ...(search && {
          OR: [
            {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }),
      },
      select: {
        id: true,
      },
    });

    const clientIds = filteredClients.map((c) => c.id);

    if (!clientIds.length) {
      return ApiResponse.success('Orders fetched successfully', {
        orders: [],
        total: 0,
        page,
        limit,
      });
    }

    // Group orders
    const grouped = await this.prisma.order.groupBy({
      by: ['clientId'],
      where: {
        clientId: { in: clientIds },
      },
      _count: {
        id: true,
      },
    });

    // Total count (for pagination)
    const total = grouped.length;

    // Apply pagination manually
    const paginatedGrouped = grouped.slice(skip, skip + limit);

    // Fetch client details
    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: paginatedGrouped.map((g) => g.clientId!) },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Merge result
    const result = paginatedGrouped.map((g) => {
      const client = clients.find((c) => c.id === g.clientId);

      return {
        clientId: g.clientId,
        companyName: client?.companyName,
        companyLogo: client?.companyLogo,
        email: client?.user?.email,
        total: g._count.id,
      };
    });

    // Total Orders
    const totalOrders = await this.prisma.order.count({
      where: { clientId: { not: null } },
    });

    const hasNextPage = total > skip + limit;
    const hasPrevPage = skip > 0;

    return ApiResponse.success('Orders fetched successfully', {
      orders: result,
      totalOrders,
      meta: {
        total,
        page,
        limit,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage,
      },
    });
  }

  async getOrdersByClientId(clientId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        clientId,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
          },
        },
        pickupDetails: true,
        deliveryDetails: true,
        currentDriver: true,
      },
    });

    return ApiResponse.success('Orders fetched successfully', orders);
  }
}
