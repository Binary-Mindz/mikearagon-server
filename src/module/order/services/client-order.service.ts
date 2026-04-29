import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemStatus, OrderRole, OrderStatus, Role } from '@prisma/client';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { DateFilter, GetOrdersQueryDto } from '../dto/get-orders-query.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class ClientOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, clientId: string) {
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
          clientId,
          itemId: dto.itemId,
          type: dto.type,
          specialNote: dto.specialNote,
          createdById: clientId,
          createdByRole: Role.CLIENT,
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

  async getMyOrders(
    query: GetOrdersQueryDto,
    clientId?: string,
    userId?: string,
  ) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      clientId?: string;
      status?: OrderStatus;
      createdById?: string;
      createdByRole?: OrderRole;
      OR?: any[];
      createdAt?: { gte: Date };
    } = {};

    if (clientId) {
      where.clientId = clientId;
    } else {
      where.createdById = userId;
      where.createdByRole = Role.ADMIN;
    }

    // Search functionality
    if (query.search) {
      const searchTerm = query.search.toLowerCase().trim();
      const searchConditions: any[] = [
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { item: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];

      where.OR = searchConditions;
    }

    // Status filter functionality
    if (query.status) {
      where.status = query.status;
    }

    // Date filter functionality
    if (query.dateFilter) {
      const now = new Date();
      let startDate: Date;

      switch (query.dateFilter) {
        case DateFilter.LAST_3_DAYS:
          startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case DateFilter.LAST_7_DAYS:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case DateFilter.LAST_30_DAYS:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case DateFilter.LAST_90_DAYS:
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // default to 7 days
      }

      where.createdAt = {
        gte: startDate,
      };
    }

    const [orders, count] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
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
      }),
      this.prisma.order.count({
        where,
      }),
    ]);

    return ApiResponse.success('Orders fetched successfully', {
      orders,
      meta: {
        page,
        limit,
        total: count,
        hasNext: page * limit < count,
        hasPrev: page > 1,
      },
    });
  }

  async getMyOrderDetails(id: string, clientId?: string, userId?: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        ...(clientId
          ? { clientId }
          : userId && { createdById: userId, createdByRole: Role.ADMIN }),
      },
      select: {
        id: true,
        type: true,
        specialNote: true,
        item: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return ApiResponse.success('Order fetched successfully', order);
  }

  async updateOrder(
    orderId: string,
    dto: UpdateOrderDto,
    clientId: string,
    userId?: string,
  ) {
    // Check if order exists and belongs to client
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        ...(clientId
          ? { clientId }
          : userId && { createdById: userId, createdByRole: Role.ADMIN }),
      },
      include: {
        pickupDetails: true,
        deliveryDetails: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is editable
    if (
      order.status !== OrderStatus.AVAILABLE &&
      order.status !== OrderStatus.CREATED
    ) {
      throw new BadRequestException('Order is not editable now');
    }

    // If updating itemId, check if item exists and is active
    if (dto.itemId) {
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
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update order basic details
      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          ...(dto.type && { type: dto.type }),
          ...(dto.itemId && { itemId: dto.itemId }),
          ...(dto.specialNote !== undefined && {
            specialNote: dto.specialNote,
          }),
        },
      });

      // Update pickup details if provided
      if (dto.pickupDetails) {
        await tx.pickupDetails.update({
          where: {
            orderId: orderId,
          },
          data: {
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
      }

      // Update delivery details if provided
      if (dto.deliveryDetails) {
        await tx.deliveryDetails.update({
          where: {
            orderId: orderId,
          },
          data: {
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
      }

      // Fetch updated order with details
      const finalOrder = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          pickupDetails: true,
          deliveryDetails: true,
        },
      });

      return ApiResponse.success('Order updated successfully', finalOrder);
    });
  }

  // cancel order by client before pickup
  async cancelOrder(orderId: string, clientId: string, userId?: string) {
    // Check if order exists and belongs to client
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        ...(clientId
          ? { clientId }
          : userId && { createdById: userId, createdByRole: Role.ADMIN }),
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is already cancelled
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Check if order is cancelable
    if (
      order.status !== OrderStatus.AVAILABLE &&
      order.status !== OrderStatus.CREATED
    ) {
      throw new BadRequestException('Order is not cancelable now');
    }

    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    return ApiResponse.success('Order cancelled successfully');
  }
}
