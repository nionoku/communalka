import { Injectable, Logger } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { DeviceDto } from '../../process/process.dto';

const USE_MONTH_MIDDLE_VALUE_MESSAGE = '📈Применить среднемесячное потребление';

type DeviceState = DeviceDto & {
  value?: number;
};

// TODO (2024.05.11): Replace to scene?

@Injectable()
@Wizard('meter')
export class MeterWizardService {
  private readonly logger = new Logger(MeterWizardService.name);

  @WizardStep(1)
  private async requestMeterPerEachDevice(@Ctx() ctx: Scenes.WizardContext) {
    this.logger.log(`Start meter reading wizard`);

    // @ts-expect-error devices should be exist
    const devicesList: DeviceState[] = ctx.scene.state.devices;

    if (!devicesList.length) {
      this.logger.warn(`Empty list of devices`);

      await ctx.reply('Список счетчиков пуст');
      await ctx.scene.leave();
      return;
    }

    // active device is device with empty value
    const device: DeviceState = devicesList.find(
      (it) => typeof it.value === 'undefined',
    );

    if (!device) {
      // TODO (2024.05.11): Send meter to server

      this.logger.log(`All devices handled (${devicesList.length} devices)`);

      await ctx.reply('Показания счетчиков приняты и отправлены на обработку');
      await ctx.scene.leave();
      return;
    }

    // @ts-expect-error device should be exist
    ctx.scene.state.device = device;
    const deviceName = device.type + device.serialNumber;

    this.logger.log(`Handle device: ${deviceName}`);

    const lastReadingDate = Intl.DateTimeFormat('ru', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
      .format(device.lastReadingDate)
      .split(' г.')
      .at(0);

    await ctx.replyWithMarkdownV2(
      `Введите показания по счетчику:\n\n` +
        `*${deviceName}*\n\n` +
        `Среднемесячное потребление: _*${device.deltaReading}*_\n` +
        `Текущее показание счетчика: _*${device.currentValue}*_\n` +
        `Дата последней сдачи показаний: _*${lastReadingDate}*_`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: USE_MONTH_MIDDLE_VALUE_MESSAGE,
              },
            ],
          ],
        },
      },
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  private async submitMeterPerDeviceInfo(@Ctx() ctx: Scenes.WizardContext) {
    // @ts-expect-error awd
    const value: string = ctx.message.text;
    // @ts-expect-error device should be exist
    const device: DeviceState = ctx.scene.state.device;

    if (value === USE_MONTH_MIDDLE_VALUE_MESSAGE) {
      device.value = device.currentValue + device.deltaReading;
    } else {
      if (!/\d+/.test(value)) {
        // TODO (2024.05.10): notify about wring input
        throw new Error();
      }

      device.value = parseInt(value);
    }

    this.logger.log(
      `Reading value for device: ${device.serialNumber}, value: ${device.value}`,
    );

    await ctx.replyWithMarkdownV2(
      `Показание для счетчика применено, значение: _*${device.value}*_`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      },
    );

    // requred for rerun this wizard for next device
    ctx.wizard.selectStep(0);
    // process next device
    this.requestMeterPerEachDevice(ctx);
  }
}
