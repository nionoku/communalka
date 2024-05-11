import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { MeterWizardModule } from './meter-wizard/meter-wizard.module';
import { ProcessModule } from '../process/process.module';

@Module({
  imports: [ProcessModule, MeterWizardModule],
  providers: [BotService],
})
export class BotModule {}
