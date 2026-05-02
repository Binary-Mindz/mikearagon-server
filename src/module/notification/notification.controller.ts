import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Test send notification' })
  @Post('test')
  @UseGuards(JwtAuthGuard)
  sendNotification(@Body() data: SendNotificationDto) {
    return this.notificationService.sendNotification(data);
  }

  @ApiOperation({ summary: 'Get notifications' })
  @Get()
  @UseGuards(JwtAuthGuard)
  getNotifications(
    @GetUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.notificationService.getNotifications(
      userId,
      query.page,
      query.limit,
    );
  }

  @ApiOperation({ summary: 'Mark notifications as read' })
  @Patch('mark-as-read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@GetUser('sub') userId: string) {
    return this.notificationService.markAsRead(userId);
  }

  @ApiOperation({ summary: 'Get unread count' })
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  unreadCount(@GetUser('sub') userId: string) {
    return this.notificationService.unreadCount(userId);
  }
}
