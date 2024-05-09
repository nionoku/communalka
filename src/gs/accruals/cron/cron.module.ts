import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ProcessModule } from '../process/process.module';

@Module({
  imports: [ProcessModule],
  providers: [CronService],
})
export class CronModule {}
