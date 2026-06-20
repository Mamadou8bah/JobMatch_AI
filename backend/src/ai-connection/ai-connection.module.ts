import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { AiEngineClient } from './ai-engine.client';
import { AiConnectionController } from './ai-connection.controller';
import { AiConnectionService } from './ai-connection.service';

@Module({
  imports: [DatabaseModule, JobsModule],
  controllers: [AiConnectionController],
  providers: [AiConnectionService, AiEngineClient],
  exports: [AiConnectionService, AiEngineClient],
})
export class AiConnectionModule {}
