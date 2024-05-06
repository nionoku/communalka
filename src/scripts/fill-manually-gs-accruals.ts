import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AccrualsModule } from '../gs/accruals/accruals.module';
import { AccrualsService } from '../gs/accruals/accruals.service';

async function task() {
  const app = await NestFactory.createApplicationContext(AccrualsModule);
  const service = app.get(AccrualsService);
  const logger = new Logger(AccrualsService.name);

  const from = new Date(process.argv[2]);
  const till = new Date();

  const result = await service.fetchAccruals(from, till);

  logger.log(
    `Success getting ${result.length} accuals records from id ${result.at(0).id}`,
  );

  await app.close();
}

task();
