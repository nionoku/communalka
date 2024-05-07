import { Module } from '@nestjs/common';
import { HandleAccrualsModule } from './handle-accruals/handle-accruals.module';
import { CronModule } from './cron/cron.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [HandleAccrualsModule, CronModule, TelegramBotModule],
})
export class AccrualsModule {}
