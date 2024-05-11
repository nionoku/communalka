import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [CronService],
})
export class CronModule {}
