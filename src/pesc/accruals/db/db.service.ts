import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccrualDto } from '../accruals.dto';
import { IAccrualDbService } from 'src/interfaces/accrual-db.interface';
import { PESC_Accruals } from '@prisma/client';

@Injectable()
export class DbService implements IAccrualDbService<AccrualDto, PESC_Accruals> {
  constructor(private prismaService: PrismaService) {}

  debts() {
    return this.prismaService.pESC_Accruals.findMany({
      where: {
        status: 'debt',
      },
    });
  }

  exist(accrual: AccrualDto) {
    return this.prismaService.pESC_Accruals.findUnique({
      where: {
        accrual_id: accrual.accrual_id,
      },
    });
  }

  save(accrual: AccrualDto, sessionId: number) {
    return this.prismaService.pESC_Accruals.create({
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
    return this.prismaService.pESC_Accruals.update({
      data: {
        status: accrual.status,
      },
      where: {
        accrual_id: accrual.accrual_id,
      },
    });
  }
}
