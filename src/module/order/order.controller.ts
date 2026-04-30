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
import { SearchPaginationDto } from 'src/common/dto/search-pagination.dto';
import { Role } from 'src/common/enums/role.enum';
import { ProfileGuard } from 'src/common/guards/profile.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminOrderService } from './services/admin-order.service';
import { ClientOrderService } from './services/client-order.service';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: ClientOrderService,
    private readonly adminOrderService: AdminOrderService,
  ) {}

  @ApiOperation({ summary: 'Create order by client' })
  @UseGuards(ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post('client')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentClient('id') clientId: string,
  ) {
    return this.orderService.createOrder(createOrderDto, clientId);
  }

  @ApiOperation({ summary: 'Create order by Admin' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  createByAdmin(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('sub') userId: string,
  ) {
    return this.adminOrderService.createOrder(createOrderDto, userId);
  }

  @ApiOperation({ summary: 'Get my orders list as client or admin' })
  @UseGuards(RolesGuard, ProfileGuard)
  @Roles(Role.CLIENT, Role.ADMIN)
  @Get('my')
  getMyOrders(
    @CurrentClient('id') clientId: string,
    @GetUser('sub') userId: string,
    @Query() query: GetOrdersQueryDto,
  ) {
    return this.orderService.getMyOrders(query, clientId, userId);
  }

  @ApiOperation({ summary: 'Get my order details' })
  @UseGuards(ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.ADMIN)
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @Get('my/:id')
  getMyOrderDetails(
    @Param('id') id: string,
    @CurrentClient('id') clientId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.orderService.getMyOrderDetails(id, clientId, userId);
  }

  @ApiOperation({ summary: "Get all other client's orders as admin" })
  @Get('others')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getOthersOrders(@Query() query: SearchPaginationDto) {
    return this.adminOrderService.getOthersOrders(query);
  }

  @Get('others/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getOrdersByClientId(@Param('clientId') clientId: string) {
    return this.adminOrderService.getOrdersByClientId(clientId);
  }

  @ApiOperation({ summary: 'Update order by client or admin' })
  @UseGuards(ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.ADMIN)
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @Patch(':id')
  updateOrder(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentClient('id') clientId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.orderService.updateOrder(
      orderId,
      updateOrderDto,
      clientId,
      userId,
    );
  }

  // cancel order by client before pickup
  @ApiOperation({ summary: 'Cancel order by client or admin' })
  @UseGuards(ProfileGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.ADMIN)
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @Patch(':id/cancel')
  cancelOrder(
    @Param('id') orderId: string,
    @CurrentClient('id') clientId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.orderService.cancelOrder(orderId, clientId, userId);
  }
}
