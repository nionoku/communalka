import { Module } from '@nestjs/common';
import { AccrualsService } from './accruals.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot(), DbModule],
  providers: [AccrualsService],
})
export class AccrualsModule {}
