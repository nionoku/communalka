import { AccrualResponse } from './api/api';

export type AccrualDto = {
  accrual_id: string;
  status: AccrualResponse['accruals'][number]['status'];
  accrual_date: string;
  receipt_path?: string;
};
