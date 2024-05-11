import { Module } from '@nestjs/common';
import { MeterWizardService } from './meter-wizard.service';

@Module({
  providers: [MeterWizardService],
})
export class MeterWizardModule {}
