import { Logger } from '@nestjs/common';
import { access } from 'fs/promises';
import { AccrualDto } from '../accrual.dto';
import {
  Api,
  AccrualResponse,
  GenerateAccrualReceiptResponse,
  CheckIsGeneratedAccrualReceiptResponse,
} from '../api/api';
import { CropQRCode } from '../usecase/crop-qr-code';
import { saveFile } from 'src/utils/save-file';
import { getDate } from 'src/utils/get-date';

export class Process {
  constructor(
    private api: Api,
    private from: Date,
    private till: Date,
  ) {}

  private logger = new Logger(Process.name);

  async start(): Promise<AccrualDto[]> {
    return this.fetchAccrualsAndHandle(this.from, this.till);
  }

  private async fetchAccrualsAndHandle(
    from: Date,
    till: Date,
  ): Promise<AccrualDto[]> {
    this.logger.log(
      `Fetching accruals from ${getDate(from)} till ${getDate(till)}`,
    );

    const accrualsResponse = await this.api.fetchAccruals(from, till);

    if (!accrualsResponse.ok) {
      const message = await accrualsResponse.text();
      throw this.logger.error(
        `Can't get list of accruals, code: ${accrualsResponse.status}, message: ${message}`,
      );
    }

    const handleAccruals = await (
      accrualsResponse.json() as Promise<AccrualResponse>
    )
      .then((data) => data.accruals)
      .then((accruals) =>
        accruals.map((accrual) => this.handleAccrual(accrual)),
      );

    return Promise.all(handleAccruals);
  }

  private async handleAccrual(
    document: AccrualResponse['accruals'][number],
  ): Promise<AccrualDto> {
    const documentDate = getDate(new Date(document.month));

    if (!document.allow_pdf) {
      return {
        accrual_id: document.accrual_id,
        accrual_date: documentDate,
        status: document.status,
        receipt_path: null,
      };
    }

    const receiptPath = `documents/${documentDate}_${document.accrual_id}.pdf`;
    const qrReceiptPath = `documents-qr/${documentDate}_${document.accrual_id}.png`;

    this.logger.log(
      `Start handle accrual document with id ${document.accrual_id} at ${documentDate}`,
    );

    try {
      await access(receiptPath);

      this.logger.log(`Accrual document ${receiptPath} already exist`);
    } catch (err) {
      // save file locally when not exist
      this.fetchAndSaveDocumentLocally(document.accrual_id, receiptPath).then(
        () => new CropQRCode(receiptPath, qrReceiptPath).handle(),
      );
    }

    return {
      accrual_id: document.accrual_id,
      accrual_date: documentDate,
      status: document.status,
      receipt_path: receiptPath,
    };
  }

  private async waitGenerateAccrualReceipt(
    receiptTaskInfo: GenerateAccrualReceiptResponse,
  ) {
    return new Promise<URLSearchParams>(async (resolve, reject) => {
      const retriesCount = 5;
      const retriesTimeout = 5000;

      const run = (retries: number) => {
        return setTimeout(async () => {
          this.logger.log(
            `Try check generate accrual receipt with task id ${receiptTaskInfo.task_id}...`,
          );

          const response = await this.api
            .checkIsGeneratedAccrualReceipt(receiptTaskInfo)
            .then(
              (it) =>
                it.json() as Promise<CheckIsGeneratedAccrualReceiptResponse>,
            );

          if (response.status === 'success') {
            const query = new URLSearchParams(response.url.split('?').at(1));

            if (!query.get('file_id')) {
              throw reject(
                `Failed getting generated accrual, 'file_id' is undefined`,
              );
            }

            this.logger.log(
              `Receipt with task id ${receiptTaskInfo.task_id} success generated, file id ${query.get('file_id')}`,
            );

            return resolve(query);
          }

          if (retries > 0) {
            return run(retries - 1);
          } else {
            return reject('Generate accrual retries is over');
          }
        }, retriesTimeout);
      };

      return run(retriesCount);
    });
  }

  private async fetchAndSaveDocumentLocally(id: string, path: string) {
    try {
      const receiptData = await this.fetchAccrualRequestParams(id)
        .then((params) => this.fetchReceiptData(params))
        .then((response) => response.arrayBuffer())
        .then(Buffer.from);

      await saveFile(path, receiptData);
    } catch (err) {
      this.logger.error(
        `Can't download accrual receipt file ${path}, message: ${err}`,
      );
    }
  }

  private async fetchReceiptData(params: URLSearchParams) {
    return this.api.fetchAccrualReceiptById(
      params.get('file_id') as string,
      params.get('author') as string,
    );
  }

  private async fetchAccrualRequestParams(id: string) {
    // send generate document request
    const data = await this.api.fetchGenerateAccrualReceiptById(id);

    if (!data.ok) {
      const message = await data.text();
      throw new Error(
        `Can't start generate accrual task, code: ${data.status}, message: ${message}`,
      );
    }

    return data
      .json()
      .then((params: GenerateAccrualReceiptResponse) =>
        this.waitGenerateAccrualReceipt(params),
      );
  }
}
