import { Module } from '@nestjs/common';
import { AccrualsModule } from './accruals/accruals.module';

@Module({
  imports: [AccrualsModule],
})
export class PescModule {}
