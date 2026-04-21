/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { User } from '../types/user.type';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }
    // Role → Profile check
    switch (user.role) {
      case 'CLIENT': {
        const client = await this.prisma.client.findUnique({
          where: { userId: user.sub },
        });
        if (!client) throw new ForbiddenException('Client not found');

        // attach to request
        request.client = {
          id: client.id,
        };
        break;
      }

      // case 'PET_HOTEL': {
      //   const hotel = await this.prisma.hotelProfile.findUnique({
      //     where: { userId: user.id },
      //   });
      //   if (!hotel) throw new ForbiddenException('Hotel profile not found');

      //   request.hotelProfile = {
      //     id: hotel.id,
      //   };
      //   break;
      // }

      default:
        throw new ForbiddenException('Invalid role');
    }

    return true;
  }
}
