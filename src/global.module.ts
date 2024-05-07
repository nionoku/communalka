import { Global, Module } from '@nestjs/common';
import { SESSIONS } from './constants';
import { getSessions } from './gs/utils/sessions';

@Global()
@Module({
  providers: [
    {
      provide: SESSIONS,
      useValue: getSessions(),
    },
  ],
  exports: [SESSIONS],
})
export class GlobalModule {}
