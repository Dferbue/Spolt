import { Test, TestingModule } from '@nestjs/testing';
import { FrindshipsController } from './frindships.controller';
import { FrindshipsService } from './frindships.service';

describe('FrindshipsController', () => {
  let controller: FrindshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrindshipsController],
      providers: [FrindshipsService],
    }).compile();

    controller = module.get<FrindshipsController>(FrindshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
