import { Module } from '@nestjs/common';
import { CronModule } from './cron/cron.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [CronModule, TelegramBotModule],
})
export class AccrualsModule {}
