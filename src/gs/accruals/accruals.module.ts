import { Module } from '@nestjs/common';
import { HandleAccrualsModule } from './handle-accruals/handle-accruals.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [HandleAccrualsModule, CronModule],
})
export class AccrualsModule {}
