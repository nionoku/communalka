import { Inject, Injectable, Logger } from '@nestjs/common';
import { Api } from '../api/api';
import { DbService } from '../db/db.service';
import { Process } from './process';
import { BotService } from '../bot/bot.service';
import { SESSIONS } from '../../../constants';
import { AccountWithCredentials } from 'src/account/account.types';

@Injectable()
export class ProcessService {
  constructor(
    @Inject(SESSIONS)
    private sessions: AccountWithCredentials[],

    private databaseService: DbService,

    private telegramBotService: BotService,
  ) {}

  private readonly logger = new Logger(ProcessService.name);

  async fetchAccruals(from: Date, till: Date) {
    this.logger.log(
      `Start task for getting accruals from ${from.toISOString().split('T').at(0)} till ${till.toISOString().split('T').at(0)}`,
    );

    const tasks = this.sessions.map(
      async ({ id, area, notify_to, GS_Account }, index) => {
        this.logger.log(`Start task for getting accruals for area ${area}`);

        const api = new Api(GS_Account.GS_Session.token);
        const documents = await new Process(api, from, till).start();

        const records = documents.map(async (document) => {
          const existRecord = await this.databaseService.exist(document);

          if (!existRecord) {
            return this.databaseService.save(document, id);
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
