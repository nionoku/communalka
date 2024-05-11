import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import {
  GS_NOTIFICATION_METERS_EXPRESSION,
  GS_NOTIFICATION_METERS_START_DAY_OF_MONTH,
} from './cron.constants';
import { Cron } from '@nestjs/schedule';
import { Account } from '@prisma/client';
import { SESSIONS } from '../../../constants';
import use from '../../../lib/scope-extensions';
import { DbService } from '../db/db.service';

@Injectable()
export class CronService {
  constructor(
    @Inject(SESSIONS)
    private sessions: Account[],

    @InjectBot()
    private botService: Telegraf<Context>,

    private databaseService: DbService,
  ) {}

  private readonly logger = new Logger(CronService.name);

  // TODO (2024.05.12): move method to process service
  @Cron(GS_NOTIFICATION_METERS_EXPRESSION)
  async sendNotificationsAboutNeedMeterReading() {
    this.logger.log(
      `Start task to send notifications about the need meter readings`,
    );

    const shouldBeNotifiedPromises = this.sessions.map(async (session) => {
      // include only areas for which no values were sent for the current period
      const include = await this.databaseService
        .lastReadingMetersDate(session.area)
        .then((data) => data.created_at)
        .then((date) => {
          const firstDateWhenNotified = use(new Date())
            .also((date) => {
              date.setDate(GS_NOTIFICATION_METERS_START_DAY_OF_MONTH);
            })
            .item();

          return date.getTime() < firstDateWhenNotified.getTime();
        });

      return {
        ...session,
        include,
      };
    });

    const shouldBeNotified = await Promise.all(shouldBeNotifiedPromises)
      .then((items) => items.filter(({ include }) => include))
      .then((sessions) =>
        // send notifications for each user with grouping areas
        Object.groupBy(sessions, ({ notify_to }) => notify_to),
      );

    const tasks = Object.entries(shouldBeNotified).map(
      ([notify_to, sessions]) => {
        return this.botService.telegram.sendMessage(
          notify_to,
          'Напоминание о необходимости подать показания по счетчикам',
          {
            reply_markup: {
              inline_keyboard: [
                sessions.map(({ area }) => ({
                  text: `🏡 ${area}`,
                  callback_data: `meter-reading-area:${area}`,
                })),
              ],
            },
            parse_mode: 'MarkdownV2',
          },
        );
      },
    );

    return Promise.all(tasks);
  }
}
