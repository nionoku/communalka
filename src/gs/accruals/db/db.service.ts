import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AccrualDto } from '../accrual.dto';

@Injectable()
export class DbService {
  constructor(private prismaService: PrismaService) {}

  exist(accrual: AccrualDto) {
    return this.prismaService.gS_Accruals.findUnique({
      where: {
        accrual_id: accrual.accrual_id,
      },
    });
  }

  save(accrual: AccrualDto, area: string) {
    return this.prismaService.gS_Accruals.create({
      data: {
        ...accrual,
        area,
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
