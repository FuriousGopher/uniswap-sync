CREATE TABLE "pool" (
        "id" VARCHAR PRIMARY KEY,
        "token0" VARCHAR NOT NULL,
        "token1" VARCHAR NOT NULL,
        "liquidity" NUMERIC NOT NULL
);

CREATE INDEX "idx_pool_token0" ON "pool" ("token0");
CREATE INDEX "idx_pool_token1" ON "pool" ("token1");

CREATE TABLE "tick" (
        "id" SERIAL PRIMARY KEY,
        "tickIdx" INT NOT NULL,
        "liquidityGross" VARCHAR NOT NULL,
        "liquidityNet" VARCHAR NOT NULL,
        "poolId" VARCHAR NOT NULL REFERENCES "pool"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "idx_tick_unique" ON "tick" ("tickIdx", "poolId");

CREATE INDEX "idx_tick_poolId" ON "tick" ("poolId");
CREATE INDEX "idx_tick_tickIdx" ON "tick" ("tickIdx");