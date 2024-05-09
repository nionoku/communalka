import { Module } from '@nestjs/common';
import { HandleAccrualsService } from './handle-accruals.service';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';
import { AccountService } from '../../../account/account.service';

@Module({
  imports: [TelegramBotModule],
  providers: [AccountService, HandleAccrualsService],
  exports: [HandleAccrualsService],
})
export class HandleAccrualsModule {}
