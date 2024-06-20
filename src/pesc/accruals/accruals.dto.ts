import { PESC_Accruals } from '@prisma/client';
import { Status } from './api/api.types';

export type AccrualDto = Pick<
  PESC_Accruals,
  'accrual_id' | 'accrual_date' | 'receipt_path'
> & {
  status: Status;
};
