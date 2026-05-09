import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentDriver } from 'src/common/decorators/get-driver.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ProfileGuard } from 'src/common/guards/profile.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/module/auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';

@ApiTags('Driver')
@UseGuards(JwtAuthGuard)
@Controller('driver/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @UseGuards(RolesGuard, ProfileGuard)
  @Roles(Role.DRIVER)
  checkIn(@CurrentDriver('id') driverId: string) {
    return this.attendanceService.checkIn(driverId);
  }

  @Post('check-out')
  @UseGuards(RolesGuard, ProfileGuard)
  @Roles(Role.DRIVER)
  checkOut(@CurrentDriver('id') driverId: string) {
    return this.attendanceService.checkOut(driverId);
  }
}
