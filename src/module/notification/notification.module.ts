import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [FirebaseModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
