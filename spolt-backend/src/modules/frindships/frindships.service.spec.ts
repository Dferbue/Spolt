import { Test, TestingModule } from '@nestjs/testing';
import { FrindshipsService } from './frindships.service';

describe('FrindshipsService', () => {
  let service: FrindshipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrindshipsService],
    }).compile();

    service = module.get<FrindshipsService>(FrindshipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
