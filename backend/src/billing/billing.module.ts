import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { EntitlementsService } from './entitlements.service';
import { ModemPayService } from './modempay.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [BillingService, EntitlementsService, ModemPayService],
  exports: [BillingService, EntitlementsService, ModemPayService],
})
export class BillingModule {}
