import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HandleAccrualsService } from '../handle-accruals/handle-accruals.service';

@Injectable()
export class CronService {
  constructor(private accrualsService: HandleAccrualsService) {}

  private readonly logger = new Logger(CronService.name);

  @Cron('0 0 12 * * *')
  async checkAccrualsDaily() {
    this.logger.log(`Start daily check accruals cron`);

    const now = new Date();
    // first day of previous month
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // last day of current month
    const till = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.accrualsService.fetchAccruals(from, till);
  }
}