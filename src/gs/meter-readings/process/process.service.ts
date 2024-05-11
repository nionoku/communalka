import { Injectable } from '@nestjs/common';
import { Api, GetMeters, Meter } from '../api/api';
import { Device, DeviceDto } from '../device.dto';
import { DbService } from '../db/db.service';
import { Account } from '@prisma/client';

@Injectable()
export class ProcessService {
  constructor(private databaseService: DbService) {}

  async listOfDevices(account: Account) {
    const api = new Api(account.gs_session);

    return (
      api
        .fetchMeters()
        .then<GetMeters>((response) => response.json())
        .then(({ current_meters }) => current_meters)
        // select only editable devices
        .then((devices) => devices.filter(({ readonly }) => !readonly))
        // cast to dto
        .then((devices) => devices.map<Device>((device) => new Device(device)))
    );
  }

  async sendMeterReadings(devices: DeviceDto[], account: Account) {
    const api = new Api(account.gs_session);

    const meters = devices
      .filter((it) => it.value)
      .map<Meter>((device) => ({
        meter_id: device.id,
        values: [device.value],
      }));

    await this.databaseService.saveLastReadingMetersDate(account);

    return api.sendMeters({ meters });
  }
}
