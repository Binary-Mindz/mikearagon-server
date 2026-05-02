/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SendNotification } from './dto/send-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async sendNotification(data: SendNotification) {
    // Save to DB
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        orderId: data.orderId,
      },
    });

    // Send push
    // await this.sendPush(data.userId, data.title, data.message);

    return ApiResponse.success('Notification sent successfully');
  }

  async getNotifications(userId: string, page: number, limit: number) {
    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);

    return ApiResponse.success('Notifications fetched successfully', {
      notifications,
      meta: {
        total,
        page,
        limit,
        hasNext: total > page * limit,
        hasPrev: page > 1,
      },
    });
  }

  async markAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return ApiResponse.success('Notifications marked as read successfully');
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return ApiResponse.success('Unread count fetched successfully', { count });
  }
}
