import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UniswapSyncService } from './uniswap-sync.service';
import { Pool } from './entity/pool.entity';
import { Tick } from './entity/tick.entity';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Pool, Tick]),
  ],
  providers: [UniswapSyncService],
  exports: [UniswapSyncService],
})
export class UniswapSyncModule {}
