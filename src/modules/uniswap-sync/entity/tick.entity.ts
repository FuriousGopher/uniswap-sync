import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Pool } from './pool.entity';

@Entity()
@Unique(['tickIdx', 'pool'])
export class Tick {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  tickIdx: number;

  @Column()
  liquidityGross: string;

  @Column()
  liquidityNet: string;

  @ManyToOne(() => Pool, (pool) => pool.ticks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poolId' })
  pool: Pool;
}
