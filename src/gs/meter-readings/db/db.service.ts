import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GS_Session } from '@prisma/client';

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

  async saveLastReadingMetersDate(session: GS_Session) {
    return this.prismaService.gS_Meters_History.create({
      data: {
        account: {
          connect: {
            id: session.accountId,
          },
        },
      },
    });
  }
}
