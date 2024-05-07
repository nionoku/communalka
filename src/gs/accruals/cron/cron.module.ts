import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { HandleAccrualsModule } from '../handle-accruals/handle-accruals.module';

@Module({
  imports: [HandleAccrualsModule],
  providers: [CronService],
})
export class CronModule {}
