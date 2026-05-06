import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const FirebaseProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: (configService: ConfigService) => {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        // projectId: configService.get('firebase.projectId'),
        projectId: configService.get('firebase.projectId'),
        clientEmail: configService.get('firebase.clientEmail'),
        privateKey: configService.get('firebase.privateKey'),
      }),
    });

    return app;
  },
  inject: [ConfigService],
};
