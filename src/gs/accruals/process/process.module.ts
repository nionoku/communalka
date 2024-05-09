import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { BotModule } from '../bot/bot.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, BotModule],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}
