import { Module } from '@nestjs/common';
import { AccrualsService } from './accruals.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot()],
  providers: [AccrualsService],
})
export class AccrualsModule {}
