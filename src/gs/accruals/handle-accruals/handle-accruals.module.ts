import { Module } from '@nestjs/common';
import { HandleAccrualsService } from './handle-accruals.service';
import { DbModule } from '../db/db.module';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [DbModule, TelegramBotModule],
  providers: [HandleAccrualsService],
  exports: [HandleAccrualsService],
})
export class HandleAccrualsModule {}
