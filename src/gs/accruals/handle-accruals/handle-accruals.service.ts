import { Injectable, Logger } from '@nestjs/common';
import { getSessions } from '../../utils/sessions';
import { Api } from '../api/api';
import { DbService } from '../db/db.service';
import { HandleAccruals } from './handle-accruals';

@Injectable()
export class HandleAccrualsService {
  constructor(private databaseService: DbService) {}

  private readonly logger = new Logger(HandleAccrualsService.name);

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
