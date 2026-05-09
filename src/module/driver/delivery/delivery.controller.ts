import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/module/auth/guards/jwt-auth.guard';
import { DeliveryService } from './delivery.service';

@ApiTags('Driver')
@Controller('driver/delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('my-route')
  @ApiOperation({ summary: 'Get my route orders' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  getMyRouteOrders(@GetUser('sub') userId: string) {
    return this.deliveryService.getMyRouteOrders(userId);
  }

  // @Get('my-route/:clientId')
  // @ApiOperation({ summary: 'Get my route orders by client' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.DRIVER)
  // getMyRouteOrdersByClient(@GetUser('sub') userId: string) {
  //   return this.deliveryService.getMyRouteOrdersByClient(userId);
  // }
}
