import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployerController],
  providers: [EmployerService],
})
export class EmployerModule {}
