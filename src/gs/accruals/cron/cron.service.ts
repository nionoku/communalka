import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProcessService } from '../process/process.service';
import { GS_CHECK_ACCRUALS_EXPRESSION } from './cron.constants';

@Injectable()
export class CronService {
  constructor(private accrualsService: ProcessService) {}

  private readonly logger = new Logger(CronService.name);

  @Cron(GS_CHECK_ACCRUALS_EXPRESSION)
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
