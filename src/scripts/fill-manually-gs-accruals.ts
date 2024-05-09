import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AccrualsModule } from '../gs/accruals/accruals.module';
import { ProcessService } from '../gs/accruals/process/process.service';

async function task() {
  const logger = new Logger(ProcessService.name);

  const from = new Date(process.argv[2]);
  const till = new Date();

  if (isNaN(from.getTime())) {
    throw new Error('Incorrect 1 argument: Should be date from');
  }

  const app = await NestFactory.createApplicationContext(AccrualsModule);
  const service = app.get(ProcessService);
  const result = await service.fetchAccruals(from, till);

  const message = result.length
    ? `Success getting ${result.length} accuals records from id ${result.at(0).id}`
    : `Accruals by period is empty`;
  logger.log(message);

  await app.close();
}

task();
