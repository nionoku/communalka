import { Inject, Injectable, Logger } from '@nestjs/common';
import { getSessions } from '../../utils/sessions';
import { Api } from '../api/api';
import { DbService } from '../db/db.service';
import { HandleAccruals } from './handle-accruals';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { SESSIONS } from '../../../constants';

@Injectable()
export class HandleAccrualsService {
  constructor(
    @Inject(SESSIONS)
    private sessions: ReturnType<typeof getSessions>,

    private databaseService: DbService,

    private telegramBotService: TelegramBotService,
  ) {}

  private readonly logger = new Logger(HandleAccrualsService.name);

  fetchAccruals(from: Date, till: Date) {
    this.logger.log(
      `Start task for getting accruals from ${from.toISOString().split('T').at(0)} till ${till.toISOString().split('T').at(0)}`,
    );

    const tasks = this.sessions.map(async ({ id, area, chat }, index) => {
      this.logger.log(`Start task for getting accruals for area ${area}`);

      const api = new Api(id);
      const documents = await new HandleAccruals(api, from, till).start();

      const records = documents.map(async (document) => {
        const existRecord = await this.databaseService.exist(document);

        if (!existRecord) {
          return this.databaseService.save(document, area);
        }

        if (existRecord.status !== document.status) {
          return this.databaseService.updateStatus(document);
        }

        return existRecord;
      });

      const completedRecords = await Promise.all(records)
        .then((records) => {
          this.logger.log(
            `Handled ${records.length} records of accruals for [${index}] session`,
          );

          return records;
        })
        .catch((reason) => {
          throw new Error(
            `Can't handled records of accruals for [${index}] session, reason: ${reason}`,
          );
        });

      await this.telegramBotService.notifyAboutDebts(
        completedRecords.filter((document) => document.status === 'debt'),
        chat,
      );

      return completedRecords;
    });

    return Promise.all(tasks).then((records) => records.flat());
  }
}
