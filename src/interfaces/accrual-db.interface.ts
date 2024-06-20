import { Prisma } from '@prisma/client';

type IAccrualDbService<Dto, Returns> = {
  debts(): Prisma.PrismaPromise<Returns[]>;
  exist(accrual: Dto): Prisma.PrismaPromise<Returns>;
  save(accrual: Dto, sessionId: number): Prisma.PrismaPromise<Returns>;
  updateStatus(accrual: Dto): Prisma.PrismaPromise<Returns>;
};

export { IAccrualDbService };
