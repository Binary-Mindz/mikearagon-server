import { Module } from '@nestjs/common';
import { DeliveryModule } from './delivery/delivery.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [DeliveryModule, AttendanceModule],
})
export class DriverModule {}
