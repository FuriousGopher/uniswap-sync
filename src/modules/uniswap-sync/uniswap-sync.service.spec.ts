import { Test, TestingModule } from '@nestjs/testing';
import { UniswapSyncService } from './uniswap-sync.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Pool } from './entity/pool.entity';
import { Tick } from './entity/tick.entity';
import { DataSource } from 'typeorm';
import { of } from 'rxjs';

const mockHttpService = {
  post: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const envVars: Record<string, any> = {
      UNISWAP_V3_URL: 'https://api.uniswap.org/v3/graphql',
      UNISWAP_API_KEY: 'test-api-key',
      UNISWAP_POOLS_LIMIT: 2,
    };
    return envVars[key];
  }),
};

const mockPoolRepository = {
  upsert: jest.fn(),
  findOne: jest.fn(),
};

const mockTickRepository = {
  upsert: jest.fn(),
};

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    upsert: jest.fn(),
    findOne: jest.fn().mockResolvedValue({
      id: '0xPool1',
      token0: '0xTokenA',
      token1: '0xTokenB',
      liquidity: '1000',
    }),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('UniswapSyncService', () => {
  let service: UniswapSyncService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniswapSyncService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'PoolRepository', useValue: mockPoolRepository },
        { provide: 'TickRepository', useValue: mockTickRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UniswapSyncService>(UniswapSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch and sync Uniswap data successfully', async () => {
    const mockResponse = {
      data: {
        data: {
          pools: [
            {
              id: '0xPool1',
              token0: { id: '0xTokenA' },
              token1: { id: '0xTokenB' },
              liquidity: '1000',
              ticks: [
                { tickIdx: 1, liquidityGross: '500', liquidityNet: '300' },
                { tickIdx: 2, liquidityGross: '600', liquidityNet: '400' },
              ],
            },
          ],
        },
      },
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    await service.syncUniswapData();

    expect(mockHttpService.post).toHaveBeenCalledTimes(1);

    // Validate upsert calls
    expect(mockQueryRunner.manager.upsert).toHaveBeenCalledTimes(2); // Pool & Tick

    expect(mockQueryRunner.manager.upsert).toHaveBeenCalledWith(
      Pool,
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          token0: expect.any(String),
          token1: expect.any(String),
          liquidity: expect.any(String),
        }),
      ]),
      ['id'],
    );

    expect(mockQueryRunner.manager.upsert).toHaveBeenCalledWith(
      Tick,
      expect.arrayContaining([
        expect.objectContaining({
          tickIdx: expect.any(Number),
          liquidityGross: expect.any(String),
          liquidityNet: expect.any(String),
          pool: expect.objectContaining({
            id: expect.any(String),
          }),
        }),
      ]),
      ['tickIdx', 'pool'],
    );
  });

  it('should handle empty Uniswap response gracefully', async () => {
    mockHttpService.post.mockReturnValue(of({ data: { data: { pools: [] } } }));

    await service.syncUniswapData();

    expect(mockHttpService.post).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.manager.upsert).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    mockHttpService.post.mockImplementation(() => {
      throw new Error('Uniswap API Error');
    });

    await expect(service.syncUniswapData()).resolves.not.toThrow();
    expect(mockHttpService.post).toHaveBeenCalledTimes(1);
  });
});
