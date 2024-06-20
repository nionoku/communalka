export type Status = 'debt' | 'paid';

export type Bill = {
  id: number;
  accountId: number;
  amount: number;
  timestamp: string; // 01.04.2024 00:00:00
  file: string | null;
};
