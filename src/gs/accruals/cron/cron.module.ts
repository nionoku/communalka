import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { HandleAccrualsModule } from '../handle-accruals/handle-accruals.module';

@Module({
  imports: [ScheduleModule.forRoot(), HandleAccrualsModule],
  providers: [CronService],
})
export class CronModule {}
