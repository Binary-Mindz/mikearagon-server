import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemStatus } from '@prisma/client';
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
}
