/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
