import { Inject, Injectable, Logger } from '@nestjs/common';
import { Account } from '@prisma/client';
import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context, Scenes } from 'telegraf';
import { SESSIONS } from '../../../constants';
import { ProcessService } from '../process/process.service';
import { MeterWizardState } from './meter-wizard/meter-wizard.dto';

@Update()
@Injectable()
export class BotService {
  constructor(
    @Inject(SESSIONS)
    private sessions: Account[],

    private processService: ProcessService,
  ) {}

  private readonly logger = new Logger(BotService.name);

  @Command('meter')
  async onStartMeterWizard(@Ctx() ctx: Context) {
    await ctx.reply(
      'Выберите помещение, для которого передать\nпоказания счетчиков',
      {
        reply_markup: {
          inline_keyboard: [
            // TODO (2024.05.11): Add loader for inline keyboard buttons
            this.sessions.map(({ area }) => ({
              text: `🏡 ${area}`,
              callback_data: `meter-reading-area:${area}`,
            })),
          ],
        },
      },
    );
  }

  @Action(/meter-reading-area:([\d]+)/)
  async onSelectArea(
    @Ctx() ctx: Scenes.WizardContext & { match: RegExpMatchArray },
  ) {
    const session = this.sessions.find(
      (it) => it.area === parseInt(ctx.match[1]),
    );

    this.logger.log(`Start handle meter reading for area ${ctx.match[1]}`);

    const devices = await this.processService
      .listOfDevices(session.gs_session)
      .then((devices) => devices.map((device) => device.toDto()));

    this.logger.log(
      `Handle ${devices.length} devices for area ${ctx.match[1]}`,
    );

    ctx.scene.enter('meter', {
      devices,
      // required for send information
      session: session.gs_session,
    } satisfies MeterWizardState);
  }
}
