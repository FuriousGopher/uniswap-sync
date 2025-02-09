import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Pool } from './entity/pool.entity';
import { Tick } from './entity/tick.entity';
import { PoolData } from './types/uniswap.types';

@Injectable()
export class UniswapSyncService {
  private readonly logger = new Logger(UniswapSyncService.name);
  private readonly uniswapUrl: string;
  private readonly apiKey: string;
  private readonly poolsLimit: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.uniswapUrl = this.configService.get<string>(
      'UNISWAP_V3_URL',
    ) as string;
    this.apiKey = this.configService.get<string>('UNISWAP_API_KEY') as string;
    this.poolsLimit = this.configService.get<number>(
      'UNISWAP_POOLS_LIMIT',
      100,
    );
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncUniswapData(): Promise<void> {
    this.logger.warn('Fetching Uniswap V3 pool data...');
    const requestUrl = this.uniswapUrl.replace('{api-key}', this.apiKey);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          requestUrl,
          {
            query: `{
              pools(first: ${this.poolsLimit}) {
                id
                token0 { id }
                token1 { id }
                liquidity
                ticks {
                  tickIdx
                  liquidityGross
                  liquidityNet
                }
              }
            }`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const poolsData: PoolData[] = response.data?.data?.pools || [];

      if (!poolsData.length) {
        this.logger.warn('No pools found in the Uniswap response');
        return;
      }

      const pools = poolsData.map((pool: PoolData) => ({
        id: pool.id,
        token0: pool.token0.id,
        token1: pool.token1.id,
        liquidity: pool.liquidity,
      }));

      await queryRunner.manager.upsert(Pool, pools, ['id']);

      for (const pool of poolsData) {
        if (pool.ticks && pool.ticks.length > 0) {
          const poolEntity = await queryRunner.manager.findOne(Pool, {
            where: { id: pool.id },
          });

          if (!poolEntity) {
            this.logger.error(`Pool with ID ${pool.id} not found.`);
            continue;
          }

          const ticks: Partial<Tick>[] = pool.ticks.map((tick) => ({
            tickIdx: tick.tickIdx,
            liquidityGross: BigInt(tick.liquidityGross).toString(),
            liquidityNet: BigInt(tick.liquidityNet).toString(),
            pool: { id: pool.id } as Pool,
          }));

          await queryRunner.manager.upsert(Tick, ticks, ['tickIdx', 'pool']);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Synced tick data for ${pools.length} pools`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error fetching Uniswap data: ${error.message}`,
        error.stack,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
