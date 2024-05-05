import { Module } from '@nestjs/common';
import { AccrualsModule } from './accruals/accruals.module';

@Module({
  imports: [AccrualsModule],
  providers: [],
})
export class GsModule {}
