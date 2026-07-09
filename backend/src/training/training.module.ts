import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { DatabaseModule } from '../database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { AiConnectionModule } from '../ai-connection/ai-connection.module';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [DatabaseModule, JobsModule, AiConnectionModule, BillingModule],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
