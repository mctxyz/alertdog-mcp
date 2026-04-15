import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCexPriceSubscriptionDeletePayload,
  normalizeCexFutureSettleTimeDiffArbitrageListArgs,
  normalizeCexPriceSubscriptionCreateArgs,
  normalizeIndexedSubscriptionPage,
} from "./cex-monitor-tool-helper.js";

test("buildCexPriceSubscriptionDeletePayload keeps ids shape unchanged", () => {
  const payload = buildCexPriceSubscriptionDeletePayload({
    apiKey: "test-key",
    ids: [12, 34],
  });

  assert.deepEqual(payload, {
    ids: [12, 34],
  });
});

test("normalizeCexPriceSubscriptionCreateArgs keeps volume filter behavior", () => {
  const args = normalizeCexPriceSubscriptionCreateArgs({
    apiKey: "test-key",
    asset_id: 2,
    monitor_type: 1,
    monitor_interval: 60,
    type: 3,
    symbol: 1,
    value: "10",
    exchanges: ["binance", "okex"],
    notify_interval: 300,
    channels: [1001],
    min_quote_volume: "100000",
    vol_interval: "5m",
  }, {
    monitorTypeValues: [1, 2],
    monitorIntervalValues: [60, 300, 900, 1800, 3600, 21600, 43200, 86400],
    triggerTypeValues: [1, 2, 3, 4, 5, 6],
    symbolOperatorValues: [1, 2],
    exchangeValues: ["binance", "okex", "bybit", "bitget", "gate"],
    notifyIntervalValues: [60, 180, 300, 600, 1800, 3600, 7200, 10800, 14400, 21600, 28800, 36000, 43200, 86400],
    volumeIntervalValues: ["5m", "10m", "15m", "30m", "1h", "4h", "6h", "12h", "1d"],
  });

  assert.deepEqual(args, {
    apiKey: "test-key",
    assetId: 2,
    monitorType: 1,
    monitorInterval: 60,
    triggerType: 3,
    symbolOperator: 1,
    value: "10",
    exchanges: ["binance", "okex"],
    notifyInterval: 300,
    lastNotify: 0,
    notifyHistoryRetention: 1,
    channels: [1001],
    disabled: 0,
    minQuoteVolume: "100000",
    volInterval: "5m",
    volVolumeMultiple: undefined,
  });
});

test("normalizeCexFutureSettleTimeDiffArbitrageListArgs prefers index and limit pagination", () => {
  const args = normalizeCexFutureSettleTimeDiffArbitrageListArgs({
    apiKey: "test-key",
    index: 3,
    limit: 25,
    quote: "USDT",
    assetId: 12,
  });

  assert.deepEqual(args, {
    apiKey: "test-key",
    index: 3,
    limit: 25,
    quote: "USDT",
    assetId: 12,
  });
});

test("normalizeCexFutureSettleTimeDiffArbitrageListArgs keeps page as index alias", () => {
  const args = normalizeCexFutureSettleTimeDiffArbitrageListArgs({
    apiKey: "test-key",
    page: 4,
    limit: 50,
    quote: "USDT",
  });

  assert.deepEqual(args, {
    apiKey: "test-key",
    index: 4,
    limit: 50,
    quote: "USDT",
    assetId: 0,
  });
});

test("normalizeIndexedSubscriptionPage fills index and limit when upstream page omits them", () => {
  const page = normalizeIndexedSubscriptionPage(
    {
      total: 418,
      base: 0,
      offset: 100,
      desc: true,
    },
    2,
    100,
  );

  assert.deepEqual(page, {
    total: 418,
    base: 0,
    offset: 100,
    index: 2,
    next: null,
    limit: 100,
    desc: true,
  });
});
