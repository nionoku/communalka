import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getSessions } from '../utils/sessions';
import { Api } from './api/api';
import { DbService } from './db/db.service';
import { HandleAccruals } from './handle-accruals/handle-accruals';

@Injectable()
export class AccrualsService {
  constructor(private databaseService: DbService) {}

  private readonly logger = new Logger(AccrualsService.name);

  @Cron('0 0 12 * * *')
  private async checkAccrualsDaily() {
    this.logger.log(`Start daily check accruasl cron`);

    const now = new Date();
    // first day of previous month
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // last day of current month
    const till = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.fetchAccruals(from, till);
  }

  fetchAccruals(from: Date, till: Date) {
    this.logger.log(
      `Start task for getting accruals from ${from.toISOString().split('T').at(0)} till ${till.toISOString().split('T').at(0)}`,
    );

    const tasks = getSessions().map(async ({ id, area }) => {
      this.logger.log(`Start task for getting accruals for area ${area}`);

      const api = new Api(id);
      const documents = await new HandleAccruals(api, from, till).start();

      const records = documents.map((document) => {
        const existRecord = this.databaseService.exist(document);

        if (existRecord) {
          return existRecord;
        }

        return this.databaseService.save(document, area);
      });

      return Promise.all(records);
    });

    return Promise.all(tasks).then((records) => records.flat());
  }
}
