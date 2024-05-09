import { Injectable, Logger } from '@nestjs/common';
import { Command, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { DbService } from '../db/db.service';
import { GS_Accruals } from '@prisma/client';

@Update()
@Injectable()
export class BotService {
  constructor(
    @InjectBot()
    private bot: Telegraf<Context>,

    private databaseService: DbService,
  ) {}

  private readonly logger = new Logger(BotService.name);

  async notifyAboutDebts(documents: GS_Accruals[], chatId: number) {
    // TODO (2024.05.07): Add button to notify is paid
    return this.handleDebts(documents, (message) => {
      return this.bot.telegram.sendMessage(chatId, message);
    })
      .then((tasks) => {
        this.logger.log(`Send notifications abouts debts to [${chatId}] chat`);

        return tasks;
      })
      .catch((reason) => {
        throw new Error(
          `Can't send notifications about debs to [${chatId}] chat, reason: ${reason}`,
        );
      });
  }

  @Command('debts')
  private async printDebts(@Ctx() ctx: Context) {
    const debts = await this.databaseService.debts();
    return this.handleDebts(debts, (message) => {
      return ctx.replyWithMarkdownV2(message);
    });
  }

  private unpaidMessage(document: GS_Accruals): string {
    const paylinkAddress = new URL(
      // TODO (2024.05.07): Replace receipt path to paylink path
      document.receipt_path /*, `http://${localAddress}:${port}`*/,
    );

    return (
      'Квитанция по кварплате\n\n' +
      `Дата квитанции: ${document.accrual_date}\n` +
      `Ссылка на оплату: ${paylinkAddress}`
    );
  }

  private async handleDebts(
    documents: GS_Accruals[],
    handleSendMessage: (message: string) => Promise<unknown>,
  ) {
    if (!documents.length) {
      await handleSendMessage('Все квитанции по кварплате оплачены');

      return;
    }

    // TODO (2024.05.07): Add IP address with port (host) for receipt URL
    // const localAddress = networkInterfaces()['eth0'].at(0).address;

    const tasks = documents.map((document) => {
      return handleSendMessage(this.unpaidMessage(document));
    });

    await Promise.all(tasks);
  }
}
