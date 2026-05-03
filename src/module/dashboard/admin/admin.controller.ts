import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/module/auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('Admin Dashboard')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get admin dashboard stats' })
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @ApiOperation({ summary: 'Get admin dashboard analytics' })
  @Get('analytics')
  @ApiQuery({ name: 'filter', enum: ['daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'ordersSelection', enum: ['admin', 'all'] })
  getAnalytics(
    @Query('filter') filter: 'daily' | 'weekly' | 'monthly',
    @Query('ordersSelection') ordersSelection: 'admin' | 'all',
    @GetUser('sub') userId: string,
  ) {
    return this.adminService.getAnalytics(filter, ordersSelection, userId);
  }
}
