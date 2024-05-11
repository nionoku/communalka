import { Test, TestingModule } from '@nestjs/testing';
import { MeterWizardService } from './meter-wizard.service';

describe('MeterWizardService', () => {
  let service: MeterWizardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeterWizardService],
    }).compile();

    service = module.get<MeterWizardService>(MeterWizardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
