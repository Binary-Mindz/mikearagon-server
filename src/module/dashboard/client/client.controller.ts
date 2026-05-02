import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentClient } from 'src/common/decorators/get-client.decorator';
import { ProfileGuard } from 'src/common/guards/profile.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/module/auth/guards/jwt-auth.guard';
import { ClientService } from './client.service';

@ApiTags('Client Dashboard')
@Controller('dashboard/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({ summary: 'Get Client Dashboard Stats' })
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard, ProfileGuard)
  getStats(@CurrentClient('id') clientId: string) {
    return this.clientService.getStats(clientId);
  }

  @ApiOperation({ summary: 'Get Client Dashboard Analytics' })
  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard, ProfileGuard)
  @ApiQuery({ name: 'filter', enum: ['daily', 'weekly', 'monthly'] })
  getAnalytics(
    @CurrentClient('id') clientId: string,
    @Query('filter') filter: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.clientService.getAnalytics(clientId, filter);
  }
}
