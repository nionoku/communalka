import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { HandleAccrualsModule } from '../handle-accruals/handle-accruals.module';

@Module({
  imports: [HandleAccrualsModule],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}
