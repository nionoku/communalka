import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import { Api, GetMeters } from '../api/api';
import { Device } from './process.dto';

@Injectable()
export class ProcessService {
  constructor() {}

  async listOfDevices(session: Account) {
    const api = new Api(session.gs_session);

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
}
