import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyRouteOrders(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      select: { state: true },
    });

    console.log(driver);
  }
}
