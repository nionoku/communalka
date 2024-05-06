import { AccuralResponse } from './api/api';

export type AccrualDto = {
  accrual_id: string;
  status: AccuralResponse['accruals'][number]['status'];
  accrual_date: string;
  receipt_path?: string;
};
