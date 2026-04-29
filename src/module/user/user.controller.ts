import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateClientAddressDto } from './dto/update-client-address.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get current user' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@GetUser('sub') userId: string) {
    return this.userService.getMe(userId);
  }

  @ApiOperation({ summary: 'Update personal info as client' })
  @Patch('personal-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  updatePersonalInfo(
    @GetUser('sub') userId: string,
    @Body() dto: UpdatePersonalInfoDto,
  ) {
    return this.userService.updatePersonalInfo(userId, dto);
  }

  @ApiOperation({ summary: 'Update client address' })
  @Patch('client-address')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  updateClientAddress(
    @GetUser('sub') userId: string,
    @Body() dto: UpdateClientAddressDto,
  ) {
    return this.userService.updateClientAddress(userId, dto);
  }
}
