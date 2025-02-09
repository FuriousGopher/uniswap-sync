import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Tick } from './tick.entity';

@Entity()
export class Pool {
  @PrimaryColumn()
  id: string;

  @Column()
  token0: string;

  @Column()
  token1: string;

  @Column({ type: 'numeric' })
  liquidity: string;

  @OneToMany(() => Tick, (tick) => tick.pool, { cascade: true })
  ticks: Tick[];
}
