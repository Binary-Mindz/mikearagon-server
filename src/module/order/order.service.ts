import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

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

      return order;
    });
  }
}
