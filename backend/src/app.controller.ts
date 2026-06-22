import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      name: 'JobMatch AI Backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /** Lightweight ping for cold-start wake-up (e.g. Render free tier). */
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'jobmatch-api',
      timestamp: new Date().toISOString(),
    };
  }
}
