import { Module } from '@nestjs/common';
import { CronModule } from './cron/cron.module';
import { BotModule } from './bot/bot.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [CronModule, BotModule, DbModule],
})
export class MeterReadingsModule {}
