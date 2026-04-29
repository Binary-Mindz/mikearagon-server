import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    const item = await this.prisma.item.create({
      data: {
        name: createItemDto.name,
      },
    });

    return ApiResponse.success('Item created successfully', item);
  }

  async findAll() {
    const items = await this.prisma.item.findMany();
    return ApiResponse.success('Items fetched successfully', items);
  }
}
