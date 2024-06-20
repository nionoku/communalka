import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, DbService],
  exports: [DbService],
})
export class DbModule {}
