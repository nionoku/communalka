import { Injectable } from '@nestjs/common';
import { Api, GetMeters, Meter } from '../api/api';
import { Device, DeviceDto } from '../device.dto';

@Injectable()
export class ProcessService {
  constructor() {}

  async listOfDevices(session: string) {
    const api = new Api(session);

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

  async sendMeterReadings(devices: DeviceDto[], session: string) {
    const api = new Api(session);

    const meters = devices.map<Meter>((device) => ({
      meter_id: device.id,
      values: [device.value],
    }));

    return api.sendMeters({ meters });
  }
}
