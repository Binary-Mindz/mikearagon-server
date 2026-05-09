import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleService } from '../schedule.service';

@Injectable()
export class AttendanceSchedule {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAbsentDrivers() {
    await this.scheduleService.markAbsentDrivers();
  }
}
