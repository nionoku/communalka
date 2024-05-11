import { Injectable, Logger } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { MeterWizardState } from './meter-wizard.dto';
import { DeviceDto } from '../../device.dto';

const USE_MONTH_MIDDLE_VALUE_MESSAGE = '📈Применить среднемесячное потребление';

// TODO (2024.05.11): Replace to scene?

@Injectable()
@Wizard('meter')
export class MeterWizardService {
  private readonly logger = new Logger(MeterWizardService.name);

  @WizardStep(1)
  private async requestMeterPerEachDevice(@Ctx() ctx: Scenes.WizardContext) {
    this.logger.log(`Start meter reading wizard`);

    const state = ctx.scene.state as MeterWizardState;
    const devicesList: DeviceDto[] = state.devices;

    if (!devicesList.length) {
      await ctx.reply('Список счетчиков пуст');
      await ctx.scene.leave();

      this.logger.warn(`Empty list of devices`);

      return;
    }

    // active device is device with empty value
    const device: DeviceDto = devicesList.find(
      (it) => typeof it.value !== 'number',
    );

    if (!device) {
      await state.onComplete(devicesList);
      // TODO (2024.05.11): Add submit button for process values
      await ctx.reply('Показания счетчиков приняты и отправлены на обработку');
      await ctx.scene.leave();

      this.logger.log(`All devices handled (${devicesList.length} devices)`);

      return;
    }

    state.currentDevice = device;
    const deviceName = device.type + device.serialNumber;

    this.logger.log(`Handling device: ${deviceName}`);

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
        `Текущее показание счетчика: _*${device.lastValue}*_\n` +
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
          resize_keyboard: true,
        },
      },
    );

    ctx.wizard.next();
  }

  @WizardStep(2)
  private async submitMeterPerDeviceInfo(@Ctx() ctx: Scenes.WizardContext) {
    // @ts-expect-error awd
    const value: string = ctx.message.text;

    const state = ctx.scene.state as MeterWizardState;
    const device: DeviceDto = state.currentDevice;

    if (value === USE_MONTH_MIDDLE_VALUE_MESSAGE) {
      device.value = device.lastValue + device.deltaReading;
    } else {
      if (!/\d+/.test(value)) {
        await ctx.reply(
          'Показание для счетчика должно быть целым числом, повторите ввод',
        );

        ctx.wizard.selectStep(1);
        return;
      }

      const parsedValue = parseInt(value);

      if (parsedValue < device.lastValue) {
        await ctx.replyWithMarkdownV2(
          `Показание для счетчика должно быть больше или равно текущему значению, текущее значение: _*${device.lastValue}*_`,
        );

        ctx.wizard.selectStep(1);
        return;
      }

      device.value = parsedValue;
    }

    this.logger.log(
      `Reading value for device: ${device.serialNumber}, value: ${device.value}`,
    );

    await ctx.replyWithMarkdownV2(
      `Показание для счетчика применено, значение: _*${device.value}*_, потребление за период: _*${device.value - device.lastValue}*_`,
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
