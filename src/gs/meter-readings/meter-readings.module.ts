import { Module } from '@nestjs/common';
import { CronModule } from './cron/cron.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [CronModule, BotModule],
})
export class MeterReadingsModule {}
