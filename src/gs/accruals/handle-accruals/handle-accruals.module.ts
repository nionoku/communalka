import { Module } from '@nestjs/common';
import { HandleAccrualsService } from './handle-accruals.service';
import { DbModule } from '../db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), DbModule],
  providers: [HandleAccrualsService],
  exports: [HandleAccrualsService],
})
export class HandleAccrualsModule {}
