import { Injectable } from '@nestjs/common';
import { OrderType, Prisma } from '@prisma/client';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private startOfDay(date: Date) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    return today;
  }

  async getStats() {
    const [totalOrders, deliveryOrders, pickupOrders, totalUsers] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({
          where: {
            type: OrderType.DELIVERY,
          },
        }),
        this.prisma.order.count({
          where: {
            type: OrderType.PICKUP,
          },
        }),
        this.prisma.client.count(),
      ]);

    return ApiResponse.success('Stats fetched successfully', {
      totalOrders,
      deliveryOrders,
      pickupOrders,
      totalUsers,
    });
  }

  async getAnalytics(
    filter: 'daily' | 'weekly' | 'monthly',
    ordersSelection: 'admin' | 'all',
    adminId: string,
  ) {
    let data;

    if (filter === 'daily') {
      const whereClause =
        ordersSelection === 'admin'
          ? Prisma.sql`WHERE "createdById" = ${adminId} AND "createdAt" >= NOW() - INTERVAL '7 days'`
          : Prisma.sql`WHERE "createdAt" >= NOW() - INTERVAL '7 days'`;

      data = await this.prisma.$queryRaw`
          SELECT
            TO_CHAR("createdAt", 'Dy') as label,
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
          FROM "Order"
          ${whereClause}
          GROUP BY TO_CHAR("createdAt", 'Dy'), DATE("createdAt")
          ORDER BY MIN("createdAt")
        `;
    } else if (filter === 'weekly') {
      const whereClause =
        ordersSelection === 'admin'
          ? Prisma.sql`WHERE "createdById" = ${adminId} AND "createdAt" >= NOW() - INTERVAL '12 weeks'`
          : Prisma.sql`WHERE "createdAt" >= NOW() - INTERVAL '12 weeks'`;

      data = await this.prisma.$queryRaw`
          SELECT
            'Week ' || TO_CHAR(DATE_TRUNC('week', "createdAt"), 'WW') as label,
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
          FROM "Order"
          ${whereClause}
          GROUP BY DATE_TRUNC('week', "createdAt")
          ORDER BY MIN("createdAt")
        `;
    } else if (filter === 'monthly') {
      const whereClause =
        ordersSelection === 'admin'
          ? Prisma.sql`WHERE "createdById" = ${adminId} AND "createdAt" >= NOW() - INTERVAL '12 months'`
          : Prisma.sql`WHERE "createdAt" >= NOW() - INTERVAL '12 months'`;

      data = await this.prisma.$queryRaw`
          SELECT
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as label,
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE "status" = 'DELIVERED')::int as delivered
          FROM "Order"
          ${whereClause}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY MIN("createdAt")
        `;
    }

    return ApiResponse.success('Analytics fetched successfully', data);
  }

  async getSummary() {
    const today = this.startOfDay(new Date());

    const totalDrivers = await this.prisma.driver.count();

    const present = await this.prisma.attendance.count({
      where: {
        date: today,
        status: 'PRESENT',
      },
    });

    const late = await this.prisma.attendance.count({
      where: {
        date: today,
        status: 'LATE',
      },
    });

    const absent = await this.prisma.attendance.count({
      where: {
        date: today,
        status: 'ABSENT',
      },
    });

    return {
      totalDrivers,
      present,
      late,
      absent,
    };
  }

  async getAttendance(query: AttendanceQueryDto) {
    const { date, page = 1, limit = 10, search, status } = query;

    const skip = (page - 1) * limit;

    // Default today
    const selectedDate = date ? new Date(date) : new Date();

    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    const where: Prisma.AttendanceWhereInput = {
      date: {
        gte: startDate,
        lte: endDate,
      },

      ...(status && {
        status,
      }),

      ...(search && {
        driver: {
          user: {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  profileImg: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },

        skip,
        take: limit,
      }),

      this.prisma.attendance.count({
        where,
      }),
    ]);

    // const formattedData = data.map((attendance) => {
    //   const checkInTime = attendance.checkInTime
    //     ? attendance.checkInTime.toLocaleTimeString()
    //     : null;

    //   const checkOutTime = attendance.checkOutTime
    //     ? attendance.checkOutTime.toLocaleTimeString()
    //     : null;

    //   const shiftHours = attendance.shiftHours
    //     ? `${Math.floor(attendance.shiftHours / 60)}h ${
    //         attendance.shiftHours % 60
    //       }m`
    //     : null;

    //   return {
    //     id: attendance.id,
    //     status: attendance.status,
    //     date: attendance.date,

    //     checkInTime,
    //     checkOutTime,
    //     shiftHours,

    //     driver: {
    //       id: attendance.driver.id,
    //       image: attendance.driver.image,

    //       user: attendance.driver.user,
    //     },
    //   };
    // });

    return ApiResponse.success('Attendance fetched successfully', {
      data: data,
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    });
  }
}
