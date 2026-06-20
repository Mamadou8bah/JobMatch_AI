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
}
