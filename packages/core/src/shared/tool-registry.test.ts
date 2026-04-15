import test from "node:test";
import assert from "node:assert/strict";

import {
  getToolSpec,
  TOOL_SPECS,
  TOOL_NAMES,
} from "./tool-registry.js";

test("TOOL_SPECS exposes all current shared tools", () => {
  assert.deepEqual(TOOL_NAMES, [
    "apikey_usage_guide",
    "apikey_get",
    "apikey_create",
    "apikey_regenerate",
    "notify_channel_list",
    "notify_channel_create",
    "notify_channel_bound_monitor_count",
    "notify_channel_delete",
    "notify_channel_set_default",
    "notify_channel_send_test",
    "cex_asset_search",
    "cex_future_settle_time_diff_arbitrage_list",
    "cex_price_subscription_create",
    "cex_price_subscription_list",
    "cex_price_subscription_set_disabled",
    "cex_price_subscription_delete",
    "cex_offical_candle_signal_feed_list",
    "cex_candle_signal_subscription_create",
    "cex_candle_signal_subscription_update",
    "cex_candle_signal_subscription_list",
    "cex_candle_signal_subscription_notify_history_list",
    "cex_candle_signal_subscription_set_disabled",
    "cex_candle_signal_subscription_delete",
  ]);

  assert.equal(TOOL_SPECS.length, TOOL_NAMES.length);
});

test("getToolSpec returns notify_channel_create compatibility metadata", () => {
  const contract = getToolSpec("notify_channel_create");

  assert.equal(contract.name, "notify_channel_create");
  assert.equal(contract.category, "notify-channel");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.deepEqual(contract.recommendedBefore, ["notify_channel_list"]);
  assert.match(
    contract.conditionalRules[0]?.message ?? "",
    /chatId/,
  );
  assert.equal(contract.examples.length > 0, true);
});

test("getToolSpec returns apikey_usage_guide as a safe onboarding tool", () => {
  const contract = getToolSpec("apikey_usage_guide");

  assert.equal(contract.requiresApiKey, false);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
  assert.equal(contract.riskLevel, "safe");
});

test("getToolSpec returns cex candle signal feed list as authenticated read-only tool", () => {
  const contract = getToolSpec("cex_offical_candle_signal_feed_list");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
  assert.equal(
    contract.responseFieldDescriptions?.some(
      (item) => item.field === "change_pct" && /Percentage price change/.test(item.description),
    ),
    true,
  );
});

test("getToolSpec returns cex asset search as a public read-only tool", () => {
  const contract = getToolSpec("cex_asset_search");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
});

test("getToolSpec returns cex future settle time diff arbitrage list as a read-only tool", () => {
  const contract = getToolSpec("cex_future_settle_time_diff_arbitrage_list");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
  assert.equal(
    Boolean(contract.inputSchema.properties?.index),
    true,
  );
  assert.equal(
    Boolean(contract.inputSchema.properties?.limit),
    true,
  );
  assert.equal(
    contract.responseFieldDescriptions?.some(
      (item) => item.field === "expectedProfit" && /expected arbitrage profit/i.test(item.description),
    ),
    true,
  );
  assert.equal(
    contract.responseFieldDescriptions?.some(
      (item) => item.field === "futures[].futurePrice.fundingInterval" && /hours between the previous and next funding settlement/i.test(item.description),
    ),
    true,
  );
});

test("getToolSpec returns cex price subscription create as a write tool", () => {
  const contract = getToolSpec("cex_price_subscription_create");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.deepEqual(contract.recommendedBefore, ["cex_asset_search", "notify_channel_list"]);
  assert.deepEqual(contract.fieldDescriptions, [
    {
      field: "monitor_type",
      description:
        "Monitoring mode. Use 1 for percentage change monitoring and 2 for absolute price monitoring.",
    },
    {
      field: "value",
      description:
        'Threshold value. For monitor_type=1 this is a percentage such as "0.01"; for monitor_type=2 this is the target price.',
    },
    {
      field: "monitor_interval",
      description:
        "Monitoring time window in seconds. Supported values: 60, 300, 900, 1800, 3600, 21600, 43200, 86400.",
    },
    {
      field: "type",
      description:
        "Trigger type. 1=spot rises above threshold, 2=spot falls below threshold, 3=futures rises above threshold, 4=futures falls below threshold, 5=spot price threshold, 6=futures price threshold.",
    },
    {
      field: "vol_interval",
      description:
        "Volume candle interval. Supported values: 5m, 10m, 15m, 30m, 1h, 4h, 6h, 12h, 1d. This field is required only when volume filtering is enabled.",
    },
    {
      field: "min_quote_volume",
      description:
        'Minimum quote volume threshold as a numeric string, such as "100000". Use it to enable minimum traded volume filtering.',
    },
    {
      field: "vol_volume_multiple",
      description:
        'Minimum volume multiple threshold as a numeric string, such as "3". This compares current quote volume against historical average volume.',
    },
    {
      field: "symbol",
      description: "Comparison operator. Use 1 for >= and 2 for <=.",
    },
  ]);
});

test("getToolSpec returns cex price subscription list as a read-only tool", () => {
  const contract = getToolSpec("cex_price_subscription_list");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
});

test("getToolSpec returns cex price subscription set disabled as a write tool", () => {
  const contract = getToolSpec("cex_price_subscription_set_disabled");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.equal(contract.riskLevel, "caution");
  assert.deepEqual(contract.recommendedBefore, ["cex_price_subscription_list"]);
});

test("getToolSpec returns cex price subscription delete as a dangerous write tool", () => {
  const contract = getToolSpec("cex_price_subscription_delete");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.equal(contract.riskLevel, "dangerous");
  assert.deepEqual(contract.recommendedBefore, ["cex_price_subscription_list"]);
});

test("getToolSpec returns cex candle signal subscription create as a write tool", () => {
  const contract = getToolSpec("cex_candle_signal_subscription_create");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.deepEqual(contract.recommendedBefore, ["notify_channel_list", "cex_offical_candle_signal_feed_list"]);
});

test("getToolSpec returns cex candle signal subscription update as a write tool", () => {
  const contract = getToolSpec("cex_candle_signal_subscription_update");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.deepEqual(contract.recommendedBefore, ["cex_candle_signal_subscription_list"]);
  assert.equal(
    contract.conditionalRules.some(
      (item) => item.when === "id" && /required when updating/.test(item.message),
    ),
    true,
  );
});

test("getToolSpec returns cex candle signal subscription list as a read-only tool", () => {
  const contract = getToolSpec("cex_candle_signal_subscription_list");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
});

test("getToolSpec returns cex candle signal subscription notify history list as an authenticated read-only tool", () => {
  const contract = getToolSpec("cex_candle_signal_subscription_notify_history_list");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, false);
  assert.equal(contract.safeToRetry, true);
  assert.deepEqual(contract.recommendedBefore, ["cex_candle_signal_subscription_list"]);
  assert.equal(
    contract.responseFieldDescriptions?.some(
      (item) => item.field === "subscribe_id" && /subscription id/.test(item.description),
    ),
    true,
  );
  assert.equal(
    contract.responseFieldDescriptions?.some(
      (item) => item.field === "page.olderCursor" && /older history/.test(item.description),
    ),
    true,
  );
  assert.equal(
    contract.responseFieldDescriptions?.some(
      (item) => item.field === "page.prev" && /real-time updates/.test(item.description),
    ),
    true,
  );
  assert.equal(
    contract.conditionalRules.some(
      (item) => item.when === "pageFlip=prev" && /previous response page\.prev as cursor/.test(item.message),
    ),
    true,
  );
  assert.equal(
    contract.conditionalRules.some(
      (item) => item.when === "pageFlip is omitted" && /latest snapshot/.test(item.message),
    ),
    true,
  );
  assert.equal(
    contract.conditionalRules.some(
      (item) => item.when === "subscribe_id is omitted" && /all candle signal subscriptions owned by the current user/.test(item.message),
    ),
    true,
  );
  assert.equal(
    (contract.examples[0]?.response as Record<string, unknown> | undefined)?.ok,
    true,
  );
});

test("getToolSpec returns cex candle signal subscription set disabled as a write tool", () => {
  const contract = getToolSpec("cex_candle_signal_subscription_set_disabled");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.deepEqual(contract.recommendedBefore, ["cex_candle_signal_subscription_list"]);
});

test("getToolSpec returns cex candle signal subscription delete as a dangerous write tool", () => {
  const contract = getToolSpec("cex_candle_signal_subscription_delete");

  assert.equal(contract.category, "cex-monitor");
  assert.equal(contract.requiresApiKey, true);
  assert.equal(contract.sideEffect, true);
  assert.equal(contract.safeToRetry, false);
  assert.equal(contract.riskLevel, "dangerous");
  assert.deepEqual(contract.recommendedBefore, ["cex_candle_signal_subscription_list"]);
});
