import { MeterValue } from '../api/api';

export type DeviceDto = {
  id: string;
  serialNumber: string;
  type: '💧' | '♨️' | '❔';
  currentValue: number;
  lastReadingDate: Date;
  deltaReading: number;
};

export class Device {
  private device: DeviceDto;

  constructor(device: MeterValue) {
    this.device = {
      id: device.id,
      serialNumber: device.serial_number,
      type: this.castType(device.type),
      currentValue: device.current_values[0] || 0,
      lastReadingDate: new Date(device.last_readings_date),
      deltaReading: Math.ceil(device.average_deltas[0] || 0),
    };
  }

  private castType(type: MeterValue['type']): DeviceDto['type'] {
    switch (type) {
      case 'ColdWaterAreaMeter':
        return '💧';

      case 'HotWaterAreaMeter':
        return '♨️';

      default:
        return '❔';
    }
  }

  toDto() {
    return this.device;
  }

  toJson() {
    return JSON.stringify(this.device);
  }
}
