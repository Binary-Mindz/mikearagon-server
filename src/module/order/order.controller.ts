import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { CurrentClient } from 'src/common/decorators/get-client.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ProfileGuard } from 'src/common/guards/profile.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminOrderService } from './services/admin-order.service';
import { ClientOrderService } from './services/client-order.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: ClientOrderService,
    private readonly adminOrderService: AdminOrderService,
  ) {}

  @ApiOperation({ summary: 'Create order by client' })
  @UseGuards(JwtAuthGuard, ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post('client')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.createOrder(createOrderDto, clientId);
  }

  @ApiOperation({ summary: 'Create order by Admin' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  createByAdmin(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('sub') userId: string,
  ) {
    return this.adminOrderService.createOrder(createOrderDto, userId);
  }

  @ApiOperation({ summary: 'Get my orders list as client' })
  @UseGuards(JwtAuthGuard, ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Get('client/my')
  getMyOrders(
    @CurrentClient('id') clientId: string,
    @Query() query: GetOrdersQueryDto,
  ) {
    return this.orderService.getMyOrders(clientId, query);
  }

  @ApiOperation({ summary: 'Get my order details as client' })
  @UseGuards(JwtAuthGuard, ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @Get('client/my/:id')
  getMyOrderDetails(
    @Param('id') id: string,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.getMyOrderDetails(id, clientId);
  }

  @ApiOperation({ summary: 'Update order by client' })
  @UseGuards(JwtAuthGuard, ProfileGuard)
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @Patch(':id')
  updateOrder(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.updateOrder(orderId, updateOrderDto, clientId);
  }

  // cancel order by client before pickup
  @ApiOperation({ summary: 'Cancel order by client' })
  @UseGuards(JwtAuthGuard, ProfileGuard)
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @Patch(':id/cancel')
  cancelOrder(
    @Param('id') orderId: string,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.cancelOrder(orderId, clientId);
  }
}
