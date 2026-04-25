import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UpdatePersonalInfoDto } from './dto/update-personal.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly userSelectWithClient = {
    ...this.userSelect,
    client: true,
  };

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelectWithClient,
    });

    return ApiResponse.success('User fetched successfully', user);
  }

  async updatePersonalInfo(userId: string, dto: UpdatePersonalInfoDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
      },
      select: this.userSelect,
    });

    return ApiResponse.success('Personal info updated successfully', user);
  }
}
