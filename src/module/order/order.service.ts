import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemStatus, OrderStatus } from '@prisma/client';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
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

  async getMyOrders(clientId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, count] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: {
          clientId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          pickupDetails: true,
          deliveryDetails: true,
        },
      }),
      this.prisma.order.count({
        where: {
          clientId,
        },
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

  async getMyOrderDetails(id: string, clientId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        clientId,
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

  async updateOrder(orderId: string, dto: UpdateOrderDto, clientId: string) {
    // Check if order exists and belongs to client
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        clientId,
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
}
