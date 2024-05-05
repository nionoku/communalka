import { Module } from '@nestjs/common';
import { GsModule } from './gs/gs.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [GsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
