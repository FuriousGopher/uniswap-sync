import { Test, TestingModule } from '@nestjs/testing';
import { UniswapSyncService } from './uniswap-sync.service';

describe('UniswapSyncService', () => {
  let service: UniswapSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniswapSyncService],
    }).compile();

    service = module.get<UniswapSyncService>(UniswapSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
