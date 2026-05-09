import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceSchedule } from './jobs/attendance.schedule';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ScheduleService, AttendanceSchedule],
})
export class SchedulesModule {}
