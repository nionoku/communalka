import { Logger } from '@nestjs/common';
import { access, writeFile } from 'fs/promises';
import {
  Api,
  AccuralResponse,
  GenerateAccuralReceiptResponse,
  CheckIsGeneratedAccuralReceiptResponse,
} from 'src/gs/accruals/api/api';

type DocumentCallbackMessage = {
  id: string;
  date: string;
  status: AccuralResponse['accruals'][number]['status'];
  receiptPath?: string;
};

export class HandleAccruals {
  constructor(
    private api: Api,
    private from: Date,
    private till: Date,
  ) {}

  private logger = new Logger(HandleAccruals.name);

  async start(): Promise<DocumentCallbackMessage[]> {
    return this.fetchAccrualsAndHandle(this.from, this.till);
  }

  private async fetchAccrualsAndHandle(
    from: Date,
    till: Date,
  ): Promise<DocumentCallbackMessage[]> {
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
  ): Promise<DocumentCallbackMessage> {
    const documentDate = document.month.split('T').at(0);

    if (!document.allow_pdf) {
      return {
        id: document.accrual_id,
        date: documentDate,
        status: document.status,
      };
    }

    const receiptPath = `documents/${documentDate}_${document.accrual_id}.pdf`;

    this.logger.log(
      `Start handle accrual document with id ${document.accrual_id} at ${documentDate}`,
    );

    try {
      await access(receiptPath);

      this.logger.log(`Accrual document ${receiptPath} already exist`);
    } catch (err) {
      // save file locally when not exist
      this.saveDocumentLocally(document.accrual_id, receiptPath);
    }

    return {
      id: document.accrual_id,
      date: documentDate,
      status: document.status,
      receiptPath,
    };
  }

  private async waitGenerateAccuralReceipt(
    receiptTaskInfo: GenerateAccuralReceiptResponse,
  ) {
    return new Promise<URLSearchParams>(async (resolve) => {
      // TODO (2024.05.04): limit requests count
      const timerId = setInterval(async () => {
        const response = await this.api
          .checkIsGeneratedAccuralReceipt(receiptTaskInfo)
          .then(
            (it) =>
              it.json() as Promise<CheckIsGeneratedAccuralReceiptResponse>,
          );

        if (response.status === 'success') {
          const query = new URLSearchParams(response.url);
          resolve(query);

          clearInterval(timerId);
        }
      }, 5000);
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
