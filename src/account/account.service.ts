import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private databaseService: PrismaService) {}

  accounts() {
    return this.databaseService.account.findMany({
      include: {
        GS_Account: {
          include: {
            GS_Session: true,
          },
        },
      },
    });
  }
}
