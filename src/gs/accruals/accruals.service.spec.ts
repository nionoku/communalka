import { Test, TestingModule } from '@nestjs/testing';
import { AccrualsService } from './accruals.service';

describe('AccrualsService', () => {
  let service: AccrualsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccrualsService],
    }).compile();

    service = module.get<AccrualsService>(AccrualsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
