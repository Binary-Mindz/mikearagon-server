import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ClientModule, AdminModule],
})
export class DashboardModule {}
