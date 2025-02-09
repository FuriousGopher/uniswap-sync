export interface Token {
  id: string;
}

export interface TickData {
  tickIdx: number;
  liquidityGross: string;
  liquidityNet: string;
}

export interface PoolData {
  id: string;
  token0: Token;
  token1: Token;
  liquidity: string;
  ticks?: TickData[];
}
