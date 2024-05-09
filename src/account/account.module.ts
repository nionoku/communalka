import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from './account.service';

@Module({
  providers: [PrismaService, AccountService],
  exports: [AccountService],
})
export class AccountModule {}
