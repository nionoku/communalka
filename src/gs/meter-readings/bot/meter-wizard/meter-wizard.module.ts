import { Module } from '@nestjs/common';
import { MeterWizardService } from './meter-wizard.service';
import { ProcessModule } from '../../process/process.module';

@Module({
  imports: [ProcessModule],
  providers: [MeterWizardService],
})
export class MeterWizardModule {}
