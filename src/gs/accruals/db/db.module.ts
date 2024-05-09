import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DbService } from './db.service';

@Module({
  providers: [PrismaService, DbService],
  exports: [DbService],
})
export class DbModule {}
