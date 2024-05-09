import { Module } from '@nestjs/common';
import { AccrualsModule } from './accruals/accruals.module';
import { MeterReadingsModule } from './meter-readings/meter-readings.module';

@Module({
  imports: [AccrualsModule, MeterReadingsModule],
})
export class GsModule {}
