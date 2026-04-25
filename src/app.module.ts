import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { ItemModule } from './module/item/item.module';
import { MailModule } from './module/mail/mail.module';
import { OrderModule } from './module/order/order.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 10 requests per minute for each IP
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    OrderModule,
    ItemModule,
    MailModule,
    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    //     transport:
    //       process.env.NODE_ENV !== 'production'
    //         ? {
    //             target: 'pino-pretty',
    //           }
    //         : undefined,
    //   },
    // }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
