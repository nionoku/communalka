import { Global, Module } from '@nestjs/common';
import { SESSIONS } from './constants';
import { AccountService } from './account/account.service';
import { AccountModule } from './account/account.module';

@Global()
@Module({
  imports: [AccountModule],
  providers: [
    {
      provide: SESSIONS,
      useFactory(accountService: AccountService) {
        return accountService.accounts();
      },
      inject: [AccountService],
    },
  ],
  exports: [SESSIONS],
})
export class GlobalModule {}
