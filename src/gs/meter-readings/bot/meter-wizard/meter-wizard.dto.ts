import { DeviceDto } from '../../device.dto';

type MeterWizardState = {
  devices: DeviceDto[];

  currentDevice?: DeviceDto;

  onComplete: (devices: DeviceDto[]) => Promise<unknown>;
};

export { MeterWizardState };
