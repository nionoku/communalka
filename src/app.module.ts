import { Module } from '@nestjs/common';
import { GsModule } from './gs/gs.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalModule } from './global.module';
import { session } from 'telegraf';
import { PescModule } from './pesc/pesc.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
      middlewares: [session()],
    }),

    GlobalModule,

    GsModule,

    PescModule,
  ],
  controllers: [],
  exports: [],
  providers: [],
})
export class AppModule {}
