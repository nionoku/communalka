import { AccountService } from './account.service';

type AccountWithCredentials = Awaited<
  ReturnType<AccountService['accounts']>
>[number];

export { AccountWithCredentials };
