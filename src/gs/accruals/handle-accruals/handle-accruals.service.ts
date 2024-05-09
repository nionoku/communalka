import { Injectable, Logger } from '@nestjs/common';
import { Api } from '../api/api';
import { DbService } from '../db/db.service';
import { HandleAccruals } from './handle-accruals';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { AccountService } from '../../../account/account.service';

@Injectable()
export class HandleAccrualsService {
  constructor(
    private accountService: AccountService,

    private databaseService: DbService,

    private telegramBotService: TelegramBotService,
  ) {}

  private readonly logger = new Logger(HandleAccrualsService.name);

  async fetchAccruals(from: Date, till: Date) {
    this.logger.log(
      `Start task for getting accruals from ${from.toISOString().split('T').at(0)} till ${till.toISOString().split('T').at(0)}`,
    );

    const accounts = await this.accountService.accounts();

    const tasks = accounts.map(
      async ({ gs_session, area, notify_to }, index) => {
        this.logger.log(`Start task for getting accruals for area ${area}`);

        const api = new Api(gs_session);
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
          notify_to,
        );

        return completedRecords;
      },
    );

    return Promise.all(tasks).then((records) => records.flat());
  }
}
