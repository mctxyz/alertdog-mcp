import test from "node:test";
import assert from "node:assert/strict";

import {
  AlertDogToolRuntime,
  createToolExecutorMap,
} from "./index.js";

test("tool runtime executes future settle time diff arbitrage tool with normalized payload", async () => {
  const calls: Array<{
    auth: { apiKey: string };
    params: { index: number; limit: number; quote: string; assetId?: number };
  }> = [];

  const client = {
    async listCexFutureSettleTimeDiffArbitrage(
      auth: { apiKey: string },
      params: { index: number; limit: number; quote: string; assetId?: number },
    ) {
      calls.push({ auth, params });

      return {
        page: {
          total: 1,
          offset: 50,
          desc: true,
        },
        records: [
          {
            id: 9,
            assetId: 12,
            asset: {
              id: 12,
              createdAt: "2026-04-15T00:00:00Z",
              updated_at: "2026-04-15T00:00:00Z",
              symbol: "BTC",
              slug: "bitcoin",
              name: "Bitcoin",
              category: "coin",
              icon: "https://cdn.example.com/btc.png",
            },
            quote: "USDT",
            maxExchange: "binance",
            minExchange: "gate",
            minSettleFundingRate: -0.0001,
            maxSettleFundingRate: 0.0003,
            minDiffSec: 60,
            maxDiffSec: 7200,
            minFundingTime: "2026-04-15T08:00:00Z",
            maxFundingTime: "2026-04-15T10:00:00Z",
            expectedProfit: 0.23,
            createdAt: "2026-04-15T00:00:00Z",
            updatedAt: "2026-04-15T00:05:00Z",
            futures: [
              {
                id: 1001,
                exchange: "binance",
                symbol: "BTC",
                name: "Bitcoin",
                assetId: 12,
                rawSymbol: "BTCUSDT",
                mul: 1,
                createdAt: "2026-04-15T00:00:00Z",
                updatedAt: "2026-04-15T00:00:00Z",
                futurePrice: {
                  id: 2001,
                  exchange: "binance",
                  quote: "USDT",
                  real_quote: "USDT",
                  rawSymbol: "BTCUSDT",
                  fundingRate: "0.0003",
                  markPrice: "85000",
                  vol24H: "1200000000",
                  createdAt: "2026-04-15T00:00:00Z",
                  updatedAt: "2026-04-15T00:00:00Z",
                  nextFundingTime: "2026-04-15T10:00:00Z",
                  LastFundingTime: "2026-04-15T02:00:00Z",
                  fundingInterval: 8,
                  state: 1,
                  change1m: "0.10",
                  change5m: "0.50",
                },
              },
            ],
          },
        ],
      };
    },
  };

  const runtime = new AlertDogToolRuntime(
    createToolExecutorMap(client as never),
  );

  const result = await runtime.run("cex_future_settle_time_diff_arbitrage_list", {
    apiKey: "test-key",
    index: 2,
    limit: 50,
    quote: "USDT",
    assetId: 12,
  });

  assert.deepEqual(calls, [
    {
      auth: { apiKey: "test-key" },
      params: { index: 2, limit: 50, quote: "USDT", assetId: 12 },
    },
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.count, 1);
  assert.deepEqual(result.page, {
    total: 1,
    base: 0,
    offset: 50,
    index: 2,
    next: null,
    limit: 50,
    desc: true,
  });
  assert.deepEqual(result.records, [
    {
      id: 9,
      assetId: 12,
      asset: {
        id: 12,
        symbol: "BTC",
        slug: "bitcoin",
        name: "Bitcoin",
        category: "coin",
        icon: "https://cdn.example.com/btc.png",
        createdAt: "2026-04-15T00:00:00Z",
        updatedAt: "2026-04-15T00:00:00Z",
      },
      quote: "USDT",
      maxExchange: "binance",
      minExchange: "gate",
      minSettleFundingRate: -0.0001,
      maxSettleFundingRate: 0.0003,
      minDiffSec: 60,
      maxDiffSec: 7200,
      minFundingTime: "2026-04-15T08:00:00Z",
      maxFundingTime: "2026-04-15T10:00:00Z",
      expectedProfit: 0.23,
      createdAt: "2026-04-15T00:00:00Z",
      updatedAt: "2026-04-15T00:05:00Z",
      futures: [
        {
          id: 1001,
          exchange: "binance",
          symbol: "BTC",
          name: "Bitcoin",
          assetId: 12,
          rawSymbol: "BTCUSDT",
          mul: 1,
          createdAt: "2026-04-15T00:00:00Z",
          updatedAt: "2026-04-15T00:00:00Z",
          futurePrice: {
            id: 2001,
            exchange: "binance",
            quote: "USDT",
            realQuote: "USDT",
            rawSymbol: "BTCUSDT",
            fundingRate: "0.0003",
            markPrice: "85000",
            vol24H: "1200000000",
            createdAt: "2026-04-15T00:00:00Z",
            updatedAt: "2026-04-15T00:00:00Z",
            nextFundingTime: "2026-04-15T10:00:00Z",
            lastFundingTime: "2026-04-15T02:00:00Z",
            fundingInterval: 8,
            state: 1,
            change1m: "0.10",
            change5m: "0.50",
            change15m: undefined,
            change30m: undefined,
            change1h: undefined,
            change4h: undefined,
            change12h: undefined,
            change1d: undefined,
          },
        },
      ],
    },
  ]);
});
