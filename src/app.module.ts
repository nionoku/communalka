import { Module } from '@nestjs/common';
import { GsModule } from './gs/gs.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [GsModule, TelegramBotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
