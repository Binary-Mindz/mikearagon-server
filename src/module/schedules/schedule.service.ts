import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(ScheduleService.name);

  private startOfDay(date: Date) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    return today;
  }

  async markAbsentDrivers() {
    const drivers = await this.prisma.driver.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    const today = this.startOfDay(new Date());

    for (const driver of drivers) {
      const exists = await this.prisma.attendance.findFirst({
        where: {
          driverId: driver.id,
          date: today,
        },
      });

      if (!exists) {
        await this.prisma.attendance.create({
          data: {
            driverId: driver.id,
            date: today,
            status: 'ABSENT',
          },
        });
      }
    }

    this.logger.log('Marked absent drivers');
  }
}
