import { Module } from '@nestjs/common';
import { GsModule } from './gs/gs.module';

@Module({
  imports: [GsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
