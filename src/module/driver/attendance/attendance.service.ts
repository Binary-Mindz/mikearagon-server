import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private startOfDay(date: Date) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private differenceInMinutes(date1: Date, date2: Date) {
    const diff = date1.getTime() - date2.getTime();
    return Math.floor(diff / 1000 / 60); // in minutes
  }

  async checkIn(driverId: string) {
    const today = this.startOfDay(new Date());

    const existing = await this.prisma.attendance.findFirst({
      where: {
        driverId,
        date: today,
      },
    });

    if (existing) {
      throw new BadRequestException('Already checked in');
    }

    const now = new Date();

    const isLate = now.getHours() >= 10;

    const attendance = await this.prisma.attendance.create({
      data: {
        driverId,
        date: today,
        checkInTime: now,
        status: isLate ? 'LATE' : 'PRESENT',
      },
    });

    return ApiResponse.success('Checked in successfully', attendance);
  }

  async checkOut(driverId: string) {
    const today = this.startOfDay(new Date());

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        driverId,
        date: today,
      },
    });

    if (!attendance) {
      throw new BadRequestException('Check-in first');
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('Already checked out');
    }

    const now = new Date();

    const shiftMinutes = this.differenceInMinutes(now, attendance.checkInTime!);

    const updated = await this.prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        checkOutTime: now,
        shiftHours: shiftMinutes,
      },
    });

    return ApiResponse.success('Checked out successfully', updated);
  }
}
