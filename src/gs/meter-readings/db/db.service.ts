import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Account } from '@prisma/client';

@Injectable()
export class DbService {
  constructor(private prismaService: PrismaService) {}

  lastReadingMetersDate(area: number) {
    return this.prismaService.gS_Meters_History.findFirst({
      select: {
        created_at: true,
      },
      where: {
        account: {
          area,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 1,
    });
  }

  saveLastReadingMetersDate(account: Account) {
    return this.prismaService.gS_Meters_History.create({
      data: {
        account: {
          connect: account,
        },
      },
    });
  }
}
