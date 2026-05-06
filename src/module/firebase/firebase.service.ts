import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(@Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App) {}

  async sendToDevice(token: string, title: string, body: string) {
    try {
      return await this.firebaseApp.messaging().send({
        token,
        notification: {
          title,
          body,
        },
      });
    } catch (error) {
      console.error('FCM Error:', error);
    }
  }

  sendToMultiple(tokens: string[], title: string, body: string) {
    return this.firebaseApp.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
    });
  }
}
