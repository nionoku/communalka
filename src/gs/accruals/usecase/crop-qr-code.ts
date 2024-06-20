import { Logger } from '@nestjs/common';
import { Handler } from './usecase.interface';
import { exec } from 'child_process';

class CropQRCode implements Handler<string> {
  constructor(
    private cropFrom: string,
    private qrCodePath: string,
  ) {}

  private logger = new Logger(CropQRCode.name);

  handle(): Promise<string> {
    return new Promise((resolve, reject) => {
      const cropImageTask = `
        convert ${this.cropFrom} \
          -crop 102x102+433+27 \
          -scale 300% \
          ${this.qrCodePath}
      `;

      return exec(cropImageTask, (err) => {
        if (err) {
          this.logger.error(
            `Cant crop QR from ${this.cropFrom}, reason: ${err.message}`,
          );

          return reject();
        }

        this.logger.log(
          `Cropped QR from ${this.cropFrom} saved to ${this.qrCodePath}`,
        );

        return resolve(this.qrCodePath);
      });
    });
  }
}

export { CropQRCode };
