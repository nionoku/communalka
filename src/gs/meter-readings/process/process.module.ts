import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}
