import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, clientId: string) {
    console.log(clientId);
    // return await this.prisma.$transaction(async (tx) => {
    const order = await this.prisma.order.create({
      data: {
        clientId,
        itemId: dto.itemId,
        type: dto.type,
        specialNote: dto.specialNote,
      },
    });

    // const pickupDetails = await this.prisma.pickupDetails.create({
    //   data: {
    //     orderId: order.id,
    //     contactName: dto.pickupDetails.contactName,
    //     companyAddress: dto.pickupDetails.companyAddress,
    //     companyName: dto.pickupDetails.companyName,
    //     email: dto.pickupDetails.email,
    //     suiteNumber: dto.pickupDetails.suiteNumber,
    //     zipCode: dto.pickupDetails.zipCode,
    //     city: dto.pickupDetails.city,
    //     state: dto.pickupDetails.state,
    //     phone: dto.pickupDetails.phone,
    //   },
    // });

    // const deliveryDetails = await this.prisma.deliveryDetails.create({
    //   data: {
    //     orderId: order.id,
    //     contactName: dto.pickupDetails.contactName,
    //     companyAddress: dto.pickupDetails.companyAddress,
    //     companyName: dto.pickupDetails.companyName,
    //     email: dto.pickupDetails.email,
    //     suiteNumber: dto.pickupDetails.suiteNumber,
    //     zipCode: dto.pickupDetails.zipCode,
    //     city: dto.pickupDetails.city,
    //     state: dto.pickupDetails.state,
    //     phone: dto.pickupDetails.phone,
    //   },
    // });

    return order;
    // });
  }
}
