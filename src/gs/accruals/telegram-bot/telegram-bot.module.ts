import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
