import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Account } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private databaseService: PrismaService) {}

  accounts(): Promise<Account[]> {
    return this.databaseService.account.findMany();
  }
}
