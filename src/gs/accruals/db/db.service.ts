import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AccrualDto } from '../accrual.dto';
import { IAccrualDbService } from 'src/interfaces/accrual-db.interface';
import { GS_Accruals } from '@prisma/client';

@Injectable()
export class DbService implements IAccrualDbService<AccrualDto, GS_Accruals> {
  constructor(private prismaService: PrismaService) {}

  debts() {
    return this.prismaService.gS_Accruals.findMany({
      where: {
        status: 'debt',
      },
    });
  }

  exist(accrual: AccrualDto) {
    return this.prismaService.gS_Accruals.findUnique({
      where: {
        accrual_id: accrual.accrual_id,
      },
    });
  }

  save(accrual: AccrualDto, sessionId: number) {
    return this.prismaService.gS_Accruals.create({
      data: {
        ...accrual,
        account: {
          connect: {
            id: sessionId,
          },
        },
      },
    });
  }

  updateStatus(accrual: AccrualDto) {
    return this.prismaService.gS_Accruals.update({
      data: {
        status: accrual.status,
      },
      where: {
        accrual_id: accrual.accrual_id,
      },
    });
  }
}
