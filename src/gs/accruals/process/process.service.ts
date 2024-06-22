import { Inject, Injectable, Logger } from '@nestjs/common';
import { Api } from '../api/api';
import { DbService } from '../db/db.service';
import { Process } from './process';
import { BotService } from '../bot/bot.service';
import { SESSIONS } from '../../../constants';
import { AccountWithCredentials } from 'src/account/account.types';
import { GS_Accruals } from '@prisma/client';
import { AccrualDto } from '../accrual.dto';
import { getDate } from 'src/utils/get-date';

@Injectable()
export class ProcessService {
  constructor(
    @Inject(SESSIONS)
    private sessions: AccountWithCredentials[],

    private databaseService: DbService,

    private telegramBotService: BotService,
  ) {}

  private readonly logger = new Logger(ProcessService.name);

  private getDocuments(
    GS_Account: (typeof this.sessions)[number]['GS_Account'],
    { from, till }: { from: Date; till: Date },
  ) {
    const api = new Api(GS_Account.GS_Session.token);
    return new Process(api, from, till).start();
  }

  private async commitAccrualStatus(document: AccrualDto, accountId: number) {
    const existRecord = await this.databaseService.exist(document);

    if (!existRecord) {
      return this.databaseService.save(document, accountId);
    }

    if (existRecord.status !== document.status) {
      return this.databaseService.updateStatus(document);
    }

    return existRecord;
  }

  private notifyAboutDebts(documents: GS_Accruals[], notify_to: number) {
    const shouldBeNotified = documents.filter(
      (document) => document.status === 'debt',
    );

    return this.telegramBotService.notifyAboutDebts(
      shouldBeNotified,
      notify_to,
    );
  }

  async fetchAccruals(from: Date, till: Date) {
    this.logger.log(
      `Start task for getting accruals from ${getDate(from)} till ${getDate(till)}`,
    );

    const tasks = this.sessions.map(
      async ({ id, area, notify_to, GS_Account }, index) => {
        this.logger.log(`Start task for getting GS accruals for area ${area}`);

        const documents = await this.getDocuments(GS_Account, {
          from,
          till,
        });

        const records = documents.map((document) =>
          this.commitAccrualStatus(document, id),
        );

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

        await this.notifyAboutDebts(completedRecords, notify_to);

        return completedRecords;
      },
    );

    return Promise.all(tasks).then((records) => records.flat());
  }
}
