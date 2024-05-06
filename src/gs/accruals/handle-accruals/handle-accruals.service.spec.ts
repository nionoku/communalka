import { Test, TestingModule } from '@nestjs/testing';
import { HandleAccrualsService } from './handle-accruals.service';

describe('HandleAccrualsService', () => {
  let service: HandleAccrualsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleAccrualsService],
    }).compile();

    service = module.get<HandleAccrualsService>(HandleAccrualsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
