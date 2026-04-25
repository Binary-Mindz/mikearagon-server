import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from './common/response/api-response';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return ApiResponse.success('Health check', {
      status: 'OK',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      docs: `${process.env.NODE_ENV === 'production' ? '' : `http://localhost:${process.env.PORT ?? 3000}`}/docs`,
    });
  }
}
