import { DeviceDto } from '../../device.dto';

type MeterWizardState = {
  devices: DeviceDto[];
  session: string;

  currentDevice?: DeviceDto;
};

export { MeterWizardState };
