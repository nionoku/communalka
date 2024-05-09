import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessService } from '../process/process.service';

@Injectable()
export class CronService {
  constructor(private accrualsService: ProcessService) {}

  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
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
