import { GS_Accruals } from '@prisma/client';
import { AccrualResponse } from './api/api';

export type AccrualDto = Pick<
  GS_Accruals,
  'accrual_id' | 'accrual_date' | 'receipt_path'
> & {
  status: AccrualResponse['accruals'][number]['status'];
};
