import { Injectable } from '@nestjs/common';
import { Command, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { HandleAccrualsService } from '../handle-accruals/handle-accruals.service';

@Update()
@Injectable()
export class TelegramBotService {
  constructor(private accrualsService: HandleAccrualsService) {}

  @Command('debts')
  async printDebts(ctx: Context) {
    const debts = await this.accrualsService.getDebts();

    if (!debts.length) {
      ctx.reply('Все квитанции по кварплате оплачены');

      return;
    }

    // TODO (2024.05.07): Add IP address with port (host) for receipt URL
    // const localAddress = networkInterfaces()['eth0'].at(0).address;

    debts.forEach((document) => {
      const receiptAddress = new URL(
        document.receipt_path /*, `http://${localAddress}:${port}`*/,
      );

      return ctx.replyWithMarkdownV2(
        'Квитанция по кварплате\n\n' +
          `Дата: ${document.accrual_date}\n` +
          `Квитанция: ${receiptAddress}`,
      );
    });
  }
}
