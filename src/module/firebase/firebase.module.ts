import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseProvider } from './firebase.provider';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
