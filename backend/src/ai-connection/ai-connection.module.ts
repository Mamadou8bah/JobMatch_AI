import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { DatabaseModule } from '../database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { AiEngineClient } from './ai-engine.client';
import { AiConnectionController } from './ai-connection.controller';
import { AiConnectionService } from './ai-connection.service';

@Module({
  imports: [DatabaseModule, JobsModule, BillingModule],
  controllers: [AiConnectionController],
  providers: [AiConnectionService, AiEngineClient],
  exports: [AiConnectionService, AiEngineClient],
})
export class AiConnectionModule {}
