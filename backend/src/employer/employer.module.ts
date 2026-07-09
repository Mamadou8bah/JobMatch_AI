import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { DatabaseModule } from '../database/database.module';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';

@Module({
  imports: [DatabaseModule, BillingModule],
  controllers: [EmployerController],
  providers: [EmployerService],
})
export class EmployerModule {}
