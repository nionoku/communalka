import { Module } from '@nestjs/common';
import { HandleAccrualsService } from './handle-accruals.service';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, TelegramBotModule],
  providers: [HandleAccrualsService],
  exports: [HandleAccrualsService],
})
export class HandleAccrualsModule {}
