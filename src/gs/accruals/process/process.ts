import { Logger } from '@nestjs/common';
import { access, writeFile } from 'fs/promises';
import { AccrualDto } from '../accrual.dto';
import {
  Api,
  AccuralResponse,
  GenerateAccuralReceiptResponse,
  CheckIsGeneratedAccuralReceiptResponse,
} from '../api/api';
import { exec } from 'child_process';

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
      `Fetching accruals from ${from.toISOString().split('T').at(0)} till ${till.toISOString().split('T').at(0)}`,
    );

    const accuralsResponse = await this.api.fetchAccurals(from, till);

    if (!accuralsResponse.ok) {
      const message = await accuralsResponse.text();
      throw this.logger.error(
        `Can't get list of accruals, code: ${accuralsResponse.status}, message: ${message}`,
      );
    }

    const handleAccruals = await (
      accuralsResponse.json() as Promise<AccuralResponse>
    )
      .then((data) => data.accruals)
      .then((accruals) =>
        accruals.map((accrual) => this.handleAccural(accrual)),
      );

    return Promise.all(handleAccruals);
  }

  private async handleAccural(
    document: AccuralResponse['accruals'][number],
  ): Promise<AccrualDto> {
    const documentDate = document.month.split('T').at(0);

    if (!document.allow_pdf) {
      return {
        accrual_id: document.accrual_id,
        accrual_date: documentDate,
        status: document.status,
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
      this.saveDocumentLocally(document.accrual_id, receiptPath).then(() =>
        this.cropQRCodeFromDocument(receiptPath, qrReceiptPath),
      );
    }

    return {
      accrual_id: document.accrual_id,
      accrual_date: documentDate,
      status: document.status,
      receipt_path: receiptPath,
    };
  }

  private async waitGenerateAccuralReceipt(
    receiptTaskInfo: GenerateAccuralReceiptResponse,
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
            .checkIsGeneratedAccuralReceipt(receiptTaskInfo)
            .then(
              (it) =>
                it.json() as Promise<CheckIsGeneratedAccuralReceiptResponse>,
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

            resolve(query);
          } else if (retries > 0) {
            return run(retries - 1);
          }
        }, retriesTimeout);
      };

      return run(retriesCount);
    });
  }

  private async cropQRCodeFromDocument(documentPath: string, path: string) {
    return new Promise((resolve, reject) => {
      const cropImageTask = `
        convert ${documentPath} \
          -crop 102x102+433+27 \
          -scale 300% \
          ${path}
      `;

      return exec(cropImageTask, (err) => {
        if (err) {
          this.logger.error(
            `Cant crop QR from ${documentPath}, reason: ${err.message}`,
          );

          return reject();
        }

        this.logger.log(`Cropped QR from ${documentPath} saved to ${path}`);
        return resolve(path);
      });
    });
  }

  private async saveDocumentLocally(id: string, path: string) {
    try {
      // send generate document request
      const data = await this.api.fetchGenerateAccuralReceiptById(id);

      if (!data.ok) {
        const message = await data.text();
        throw new Error(
          `Can't start generate accrual task, code: ${data.status}, message: ${message}`,
        );
      }

      const receiptRequestParams = await (
        data.json() as Promise<GenerateAccuralReceiptResponse>
      ).then((params) => this.waitGenerateAccuralReceipt(params));

      const receiptBuffer = await this.api
        .fetchAccuralReceiptById(
          receiptRequestParams.get('file_id') as string,
          receiptRequestParams.get('author') as string,
        )
        .then((it) => it.arrayBuffer());

      try {
        await writeFile(path, Buffer.from(receiptBuffer));

        this.logger.log(`File ${path} saved`);
      } catch (err) {
        this.logger.error(
          `Can't save accrual receipt file ${path}, message: ${err}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Can't download accrual receipt file ${path}, message: ${err}`,
      );
    }
  }
}
