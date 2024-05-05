import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Api } from 'src/gs/accruals/api/api';
import { HandleAccruals } from 'src/gs/accruals/handle-accruals/handle-accruals';
import { getSessions } from 'src/gs/accruals/utils/sessions';

@Injectable()
export class AccrualsService {
  private readonly logger = new Logger(AccrualsService.name);

  @Cron('0 0 12 * * *')
  async checkAccrualsDaily() {
    this.logger.log(`Start daily check accruasl cron`);

    const now = new Date();
    // first day of previous month
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // last day of current month
    const till = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const tasks = getSessions().map(async ({ id, area }) => {
      const api = new Api(id);
      const documents = await new HandleAccruals(api, from, till).start();
      // TODO (2024.05.06): push documents to db
    });

    return Promise.all(tasks);
  }
}
