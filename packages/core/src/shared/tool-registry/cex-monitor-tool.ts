import {
  AlertDogClient,
} from "../../api/alertdog.js";
import type {
  AlertDogToolRegistration,
  ToolExecutorMap,
} from "../tool-types.js";
import { createExecutorsFromRegistrations } from "../tools/common.js";
import { defineAlertDogToolSpec } from "./define-tool-contract.js";
import {
  buildCexPriceSubscriptionCreatePayload,
  buildCexPriceSubscriptionDeletePayload,
  buildCexPriceSubscriptionSetDisabledPayload,
  buildCandleSignalSubscriptionCreatePayload,
  buildCandleSignalSubscriptionDeletePayload,
  buildCandleSignalSubscriptionSetDisabledPayload,
  buildCandleSignalSubscriptionUpdatePayload,
  normalizeCandleSignalFeedListArgs,
  normalizeCandleSignalHistoryListArgs,
  normalizeCandleSignalSubscriptionCreateArgs,
  normalizeCandleSignalSubscriptionDeleteArgs,
  normalizeCandleSignalSubscriptionListArgs,
  normalizeCandleSignalSubscriptionListPayload,
  normalizeCandleSignalSubscriptionPage,
  normalizeCandleSignalSubscriptionSetDisabledArgs,
  normalizeCandleSignalSubscriptionUpdateArgs,
  normalizeCexAssetSearchArgs,
  normalizeCexFutureSettleTimeDiffArbitrageListArgs,
  normalizeIndexedSubscriptionPage,
  normalizeCexPriceSubscriptionCreateArgs,
  normalizeCexPriceSubscriptionDeleteArgs,
  normalizeCexPriceSubscriptionListArgs,
  normalizeCexPriceSubscriptionSetDisabledArgs,
  normalizeFeedPage,
  normalizeHistoryPage,
  normalizePriceSubscription,
  normalizeSubscriptionPage,
  toCexAssetPayload,
  toCexFutureSettleTimeDiffArbitragePayload,
  toHistoryPayload,
  toSignalPayload,
} from "./helpers/cex-monitor-tool-helper.js";
import { normalizeAlertDogToolError } from "./helpers/alertdog-tool.js";



export const CEX_CANDLE_SIGNAL_INTERVAL_5M = "5m";
export const CEX_CANDLE_SIGNAL_INTERVAL_10M = "10m";
export const CEX_CANDLE_SIGNAL_INTERVAL_15M = "15m";
export const CEX_CANDLE_SIGNAL_INTERVAL_30M = "30m";
export const CEX_CANDLE_SIGNAL_INTERVAL_1H = "1h";
export const CEX_CANDLE_SIGNAL_INTERVAL_4H = "4h";
export const CEX_CANDLE_SIGNAL_INTERVAL_6H = "6h";
export const CEX_CANDLE_SIGNAL_INTERVAL_12H = "12h";
export const CEX_CANDLE_SIGNAL_INTERVAL_1D = "1d";
export const CEX_CANDLE_SIGNAL_INTERVAL_VALUES = [
  CEX_CANDLE_SIGNAL_INTERVAL_5M,
  CEX_CANDLE_SIGNAL_INTERVAL_10M,
  CEX_CANDLE_SIGNAL_INTERVAL_15M,
  CEX_CANDLE_SIGNAL_INTERVAL_30M,
  CEX_CANDLE_SIGNAL_INTERVAL_1H,
  CEX_CANDLE_SIGNAL_INTERVAL_4H,
  CEX_CANDLE_SIGNAL_INTERVAL_6H,
  CEX_CANDLE_SIGNAL_INTERVAL_12H,
  CEX_CANDLE_SIGNAL_INTERVAL_1D,
] as const;
export const CEX_CANDLE_SIGNAL_DIRECTION_BOTH = 1;
export const CEX_CANDLE_SIGNAL_DIRECTION_UP = 2;
export const CEX_CANDLE_SIGNAL_DIRECTION_DOWN = 3;

export const CEX_NOTIFY_INTERVAL_1M = 60;
export const CEX_NOTIFY_INTERVAL_3M = 180;
export const CEX_NOTIFY_INTERVAL_5M = 300;
export const CEX_NOTIFY_INTERVAL_10M = 600;
export const CEX_NOTIFY_INTERVAL_30M = 1800;
export const CEX_NOTIFY_INTERVAL_1H = 3600;
export const CEX_NOTIFY_INTERVAL_2H = 7200;
export const CEX_NOTIFY_INTERVAL_3H = 10800;
export const CEX_NOTIFY_INTERVAL_4H = 14400;
export const CEX_NOTIFY_INTERVAL_6H = 21600;
export const CEX_NOTIFY_INTERVAL_8H = 28800;
export const CEX_NOTIFY_INTERVAL_10H = 36000;
export const CEX_NOTIFY_INTERVAL_12H = 43200;
export const CEX_NOTIFY_INTERVAL_24H = 86400;

export const CEX_CANDLE_SIGNAL_NOTIFY_INTERVAL_VALUES = [
  CEX_NOTIFY_INTERVAL_1M,
  CEX_NOTIFY_INTERVAL_3M,
  CEX_NOTIFY_INTERVAL_5M,
  CEX_NOTIFY_INTERVAL_10M,
  CEX_NOTIFY_INTERVAL_30M,
  CEX_NOTIFY_INTERVAL_1H,
  CEX_NOTIFY_INTERVAL_2H,
  CEX_NOTIFY_INTERVAL_3H,
  CEX_NOTIFY_INTERVAL_4H,
  CEX_NOTIFY_INTERVAL_6H,
  CEX_NOTIFY_INTERVAL_8H,
  CEX_NOTIFY_INTERVAL_10H,
  CEX_NOTIFY_INTERVAL_12H,
  CEX_NOTIFY_INTERVAL_24H,
] as const;
export const CEX_PRICE_MONITOR_TYPE_VALUES = [1, 2] as const;
export const CEX_PRICE_MONITOR_TYPE_CHANGE = 1;
export const CEX_PRICE_MONITOR_TYPE_PRICE = 2;
export const CEX_PRICE_MONITOR_INTERVAL_1M = 60;
export const CEX_PRICE_MONITOR_INTERVAL_5M = 300;
export const CEX_PRICE_MONITOR_INTERVAL_15M = 900;
export const CEX_PRICE_MONITOR_INTERVAL_30M = 1800;
export const CEX_PRICE_MONITOR_INTERVAL_1H = 3600;
export const CEX_PRICE_MONITOR_INTERVAL_6H = 21600;
export const CEX_PRICE_MONITOR_INTERVAL_12H = 43200;
export const CEX_PRICE_MONITOR_INTERVAL_24H = 86400;
export const CEX_PRICE_TRIGGER_TYPE_VALUES = [1, 2, 3, 4, 5, 6] as const;
export const CEX_PRICE_TRIGGER_TYPE_SPOT_UP = 1;
export const CEX_PRICE_TRIGGER_TYPE_SPOT_DOWN = 2;
export const CEX_PRICE_TRIGGER_TYPE_FUTURES_UP = 3;
export const CEX_PRICE_TRIGGER_TYPE_FUTURES_DOWN = 4;
export const CEX_PRICE_TRIGGER_TYPE_SPOT_PRICE = 5;
export const CEX_PRICE_TRIGGER_TYPE_FUTURES_PRICE = 6;
export const CEX_PRICE_SYMBOL_OPERATOR_VALUES = [1, 2] as const;
export const CEX_PRICE_SYMBOL_OPERATOR_GTE = 1;
export const CEX_PRICE_SYMBOL_OPERATOR_LTE = 2;
export const CEX_EXCHANGE_VALUES = [
  "binance",
  "okex",
  "bybit",
  "bitget",
  "gate",
] as const;
export const CEX_PRICE_MONITOR_INTERVAL_VALUES = [
  CEX_PRICE_MONITOR_INTERVAL_1M,
  CEX_PRICE_MONITOR_INTERVAL_5M,
  CEX_PRICE_MONITOR_INTERVAL_15M,
  CEX_PRICE_MONITOR_INTERVAL_30M,
  CEX_PRICE_MONITOR_INTERVAL_1H,
  CEX_PRICE_MONITOR_INTERVAL_6H,
  CEX_PRICE_MONITOR_INTERVAL_12H,
  CEX_PRICE_MONITOR_INTERVAL_24H,
] as const;

const CEX_PRICE_MONITOR_FIELD_DESCRIPTIONS = [
  {
    field: "monitor_type",
    description: "Monitoring mode. Use 1 for percentage change monitoring and 2 for absolute price monitoring.",
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
] as const;

const CEX_PRICE_TOOL_SHARED_DEPS = {
  monitorTypeValues: CEX_PRICE_MONITOR_TYPE_VALUES,
  monitorIntervalValues: CEX_PRICE_MONITOR_INTERVAL_VALUES,
  triggerTypeValues: CEX_PRICE_TRIGGER_TYPE_VALUES,
  symbolOperatorValues: CEX_PRICE_SYMBOL_OPERATOR_VALUES,
  exchangeValues: CEX_EXCHANGE_VALUES,
  notifyIntervalValues: CEX_CANDLE_SIGNAL_NOTIFY_INTERVAL_VALUES,
  volumeIntervalValues: CEX_CANDLE_SIGNAL_INTERVAL_VALUES,
} as const;

const CEX_CANDLE_SIGNAL_TOOL_SHARED_DEPS = {
  intervalValues: CEX_CANDLE_SIGNAL_INTERVAL_VALUES,
  directionValues: [
    CEX_CANDLE_SIGNAL_DIRECTION_BOTH,
    CEX_CANDLE_SIGNAL_DIRECTION_UP,
    CEX_CANDLE_SIGNAL_DIRECTION_DOWN,
  ] as const,
  notifyIntervalValues: CEX_CANDLE_SIGNAL_NOTIFY_INTERVAL_VALUES,
} as const;

const CEX_CANDLE_SIGNAL_FEED_RESPONSE_FIELD_DESCRIPTIONS = [
  {
    field: "id",
    description: "Official candle signal record id.",
  },
  {
    field: "asset_id",
    description: "Internal asset id used by AlertDog for the detected coin or token.",
  },
  {
    field: "asset",
    description:
      "Asset metadata for the signal target, including symbol, slug, display name, and icon.",
  },
  {
    field: "cex_coin_price_id",
    description: "Spot market price record id associated with this signal snapshot.",
  },
  {
    field: "exchange",
    description: "Exchange where the candle signal was detected, such as bitget or binance.",
  },
  {
    field: "base_symbol",
    description: "Base asset symbol used by the exchange pair, such as ARIA.",
  },
  {
    field: "raw_symbol",
    description: "Raw exchange trading pair symbol, usually a USDT pair such as ARIAUSDT.",
  },
  {
    field: "interval",
    description: "Candle interval that triggered the signal, such as 5m, 15m, or 1h.",
  },
  {
    field: "candle_start_at",
    description: "Start time of the candle window that produced the signal.",
  },
  {
    field: "candle_end_at",
    description: "End time of the candle window that produced the signal.",
  },
  {
    field: "price",
    description: "Observed signal price inside the detected candle window.",
  },
  {
    field: "change_pct",
    description: "Percentage price change for the detected candle window.",
  },
  {
    field: "avg_quote_volume",
    description: "Historical average quote volume used as the baseline for comparison.",
  },
  {
    field: "volume_multiple",
    description: "Current quote volume divided by historical average quote volume.",
  },
  {
    field: "quote_volume",
    description: "Current quote volume observed in the signal candle window.",
  },
  {
    field: "createdAt",
    description: "Record creation time in AlertDog.",
  },
  {
    field: "updatedAt",
    description: "Record update time in AlertDog.",
  },
  {
    field: "spots",
    description:
      "Spot market snapshots for the same asset across supported exchanges, filtered to USDT quote pairs.",
  },
  {
    field: "futures",
    description:
      "Futures market snapshots for the same asset across supported exchanges, filtered to USDT quote pairs.",
  },
  {
    field: "spots[].cexCoinSpotPrice.marketPrice",
    description: "Latest spot market price for that exchange and USDT pair.",
  },
  {
    field: "spots[].cexCoinSpotPrice.change1m~change1d",
    description:
      "Spot price change percentages across rolling windows from 1 minute up to 1 day.",
  },
  {
    field: "futures[].cexFutureCoinPrice.markPrice",
    description: "Latest futures mark price for that exchange and contract pair.",
  },
  {
    field: "futures[].cexFutureCoinPrice.fundingRate",
    description: "Current funding rate for the futures contract snapshot.",
  },
  {
    field:"futures[].cexFutureCoinPrice.exchange",
    description:    "Exchange identifier for the futures contract snapshot. This is the exchange where the contract belongs and where orders for this rawSymbol should be placed, such as binance, bybit, or okex."

  },
  {
    field:"futures[].cexFutureCoinPrice.rawSymbol",
    description:     "Exchange-native futures contract symbol, such as BTCUSDT. Prefer this exact value when placing orders on the exchange"

  },
  {
    field: "futures[].cexFutureCoinPrice.change1m~change1d",
    description:
      "Futures price change percentages across rolling windows from 1 minute up to 1 day.",
  },
] as const;

const CEX_FUTURE_SETTLE_TIME_DIFF_ARBITRAGE_RESPONSE_FIELD_DESCRIPTIONS = [
  {
    field: "page.total",
    description: "Total number of arbitrage archive records that match the current filters.",
  },
  {
    field: "page.offset",
    description: "Zero-based offset returned by AlertDog. The upstream page size is fixed at 100.",
  },
  {
    field: "asset",
    description: "Asset metadata for the arbitrage target, including symbol, slug, name, and icon.",
  },
  {
    field: "quote",
    description: "Quote currency shared by the arbitrage pair, such as USDT.",
  },
  {
    field: "minExchange",
    description: "Exchange with the earliest settlement window in the current arbitrage comparison.",
  },
  {
    field: "maxExchange",
    description: "Exchange with the latest settlement window in the current arbitrage comparison.",
  },
  {
    field: "minSettleFundingRate",
    description: "Funding rate on the earlier-settling exchange.",
  },
  {
    field: "maxSettleFundingRate",
    description: "Funding rate on the later-settling exchange.",
  },
  {
    field: "minDiffSec",
    description: "Minimum settlement countdown in seconds among the compared futures markets.",
  },
  {
    field: "maxDiffSec",
    description: "Maximum settlement countdown in seconds among the compared futures markets.",
  },
  {
    field: "minFundingTime",
    description: "Funding settlement timestamp for the earlier exchange.",
  },
  {
    field: "maxFundingTime",
    description: "Funding settlement timestamp for the later exchange.",
  },
  {
    field: "expectedProfit",
    description: "Expected arbitrage profit estimated by AlertDog for this settlement-time gap setup.",
  },
  {
    field: "futures[].futurePrice.fundingInterval",
    description:
      "Funding interval in hours between the previous and next funding settlement for that futures market.",
  },
] as const;

const CEX_CANDLE_SIGNAL_HISTORY_RESPONSE_FIELD_DESCRIPTIONS = [
  ...CEX_CANDLE_SIGNAL_FEED_RESPONSE_FIELD_DESCRIPTIONS,
  {
    field: "subscribe_id",
    description: "User subscription id that generated this trigger history record.",
  },
  {
    field: "user_id",
    description: "User id that owns the candle signal subscription and its trigger history.",
  },
  {
    field: "expire_at",
    description: "Expiration time for this history snapshot or retention window.",
  },
  {
    field: "page.pageFlip",
    description:
      "Optional paging direction. Omit it for the default latest query. Use prev together with cursor=page.prev to move upward and fetch newer/latest data, or use next together with cursor=page.next to move downward and fetch older history.",
  },
  {
    field: "page.prev",
    description:
      "Cursor to continue upward pagination for newer/latest data. For real-time updates, send this value back as cursor with pageFlip=prev. If the next response has no new data, keep using the previous cursor value instead of replacing it.",
  },
  {
    field: "page.next",
    description:
      "Cursor to continue downward pagination for older history records. Send this value back as cursor with pageFlip=next. If the next response has no additional history, keep using the previous cursor value instead of replacing it.",
  },
  {
    field: "page.latestCursor",
    description:
      "Convenience alias of page.prev. For incremental updates, send this value back as cursor with pageFlip=prev, and do not update the cursor when no new data is returned.",
  },
  {
    field: "page.olderCursor",
    description:
      "Convenience alias of page.next for fetching older history records. Do not update the cursor when no additional history is returned.",
  },
] as const;

export const CEX_PRICE_TOOL_REGISTRATIONS: AlertDogToolRegistration<AlertDogClient>[] = [
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_asset_search",
    description:
      "Use this tool when the user wants to search CEX assets by symbol, name, or keyword. This is an authenticated read-only operation that returns candidate asset metadata for later CEX monitor or arbitrage queries.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          minLength: 1,
          description: "Asset search keyword, such as ADA, Cardano, or btc.",
        },
      },
      required: ["keyword"],
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "cex-monitor",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "Search ADA related CEX assets",
        args: {
          keyword: "ADA",
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCexAssetSearchArgs(rawArgs);
        const assets = await client.searchCexAssets(
            { apiKey: args.apiKey },
            args.keyword);
        return {
          ok: true,
          count: assets.length,
          assets: assets.map(toCexAssetPayload),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_future_settle_time_diff_arbitrage_list",
    description:
      "Use this tool when the user wants to inspect futures funding settlement time gap arbitrage candidates. This is an authenticated read-only operation that returns normalized pagination metadata plus a list of arbitrage archive records for the selected quote or asset.",
    inputSchema: {
      type: "object",
      properties: {
        index: {
          type: "integer",
          minimum: 1,
          description: "Page index. Preferred pagination field. Defaults to 1.",
        },
        limit: {
          type: "integer",
          minimum: 1,
          description: "Page size. Defaults to 100.",
        },
        page: {
          type: "integer",
          minimum: 1,
          description: "Backward-compatible page alias. When index is omitted, page is treated as the page index.",
        },
        quote: {
          type: "string",
          minLength: 1,
          description: "Quote currency filter. Defaults to USDT.",
        },
        assetId: {
          type: "integer",
          minimum: 0,
          description: "Optional asset id. Use 0 or omit it to query all assets for the selected quote.",
        },
      },
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "cex-monitor",
    recommendedBefore: [],
    conditionalRules: [
      {
        when: "assetId is omitted or 0",
        requiredFields: ["quote"],
        message: "The tool returns all assets for the selected quote when assetId is not provided.",
      },
      {
        when: "page is provided",
        requiredFields: [],
        message: "page is kept as a backward-compatible alias. Prefer index for the page number.",
      },
      {
        when: "index is provided",
        requiredFields: ["index"],
        message: "index is the page number used for pagination.",
      },
      {
        when: "limit is provided",
        requiredFields: ["limit"],
        message: "limit is the requested page size.",
      },
    ],
    examples: [
      {
        title: "Read the first page of USDT settlement time diff arbitrage records",
        args: {
          apiKey: "user-api-key",
          index: 1,
          limit: 100,
          quote: "USDT",
        },
      },
      {
        title: "Read settlement time diff arbitrage records for a single asset",
        args: {
          apiKey: "user-api-key",
          index: 1,
          limit: 100,
          quote: "USDT",
          assetId: 2,
        },
      },
    ],
    responseFieldDescriptions: [...CEX_FUTURE_SETTLE_TIME_DIFF_ARBITRAGE_RESPONSE_FIELD_DESCRIPTIONS],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCexFutureSettleTimeDiffArbitrageListArgs(rawArgs);
        const response = await client.listCexFutureSettleTimeDiffArbitrage(
          { apiKey: args.apiKey },
          {
            index: args.index,
            limit: args.limit,
            quote: args.quote,
            ...(args.assetId > 0 ? { assetId: args.assetId } : {}),
          },
        );

        return {
          ok: true,
          count: response.records.length,
          page: normalizeIndexedSubscriptionPage(response.page, args.index, args.limit),
          records: response.records.map((record) => toCexFutureSettleTimeDiffArbitragePayload(record)),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_price_subscription_create",
    description:
      "Use this tool only when the user explicitly wants to create a CEX price monitor subscription. This is an authenticated write operation with side effects. It creates a monitor using asset, monitor type, trigger type, volume filters, exchanges, notify interval, and notification channels.",
    inputSchema: {
      type: "object",
      properties: {
        asset_id: {
          type: "integer",
          minimum: 0,
          description: "Asset id. Use 0 to monitor all assets.",
        },
        monitor_type: {
          type: "integer",
          enum: [CEX_PRICE_MONITOR_TYPE_CHANGE, CEX_PRICE_MONITOR_TYPE_PRICE],
          description: "Monitor type. 1 means percentage change, 2 means price.",
        },
        monitor_interval: {
          type: "integer",
          enum: [
            CEX_PRICE_MONITOR_INTERVAL_1M,
            CEX_PRICE_MONITOR_INTERVAL_5M,
            CEX_PRICE_MONITOR_INTERVAL_15M,
            CEX_PRICE_MONITOR_INTERVAL_30M,
            CEX_PRICE_MONITOR_INTERVAL_1H,
            CEX_PRICE_MONITOR_INTERVAL_6H,
            CEX_PRICE_MONITOR_INTERVAL_12H,
            CEX_PRICE_MONITOR_INTERVAL_24H,
          ],
          description:
            "Monitor time range in seconds. Supported values: 60, 300, 900, 1800, 3600, 21600, 43200, 86400.",
        },
        type: {
          type: "integer",
          enum: [
            CEX_PRICE_TRIGGER_TYPE_SPOT_UP,
            CEX_PRICE_TRIGGER_TYPE_SPOT_DOWN,
            CEX_PRICE_TRIGGER_TYPE_FUTURES_UP,
            CEX_PRICE_TRIGGER_TYPE_FUTURES_DOWN,
            CEX_PRICE_TRIGGER_TYPE_SPOT_PRICE,
            CEX_PRICE_TRIGGER_TYPE_FUTURES_PRICE,
          ],
          description:
            "Trigger type. 1 spot up, 2 spot down, 3 futures up, 4 futures down, 5 spot price, 6 futures price.",
        },
        vol_interval: {
          type: "string",
          enum: [...CEX_CANDLE_SIGNAL_INTERVAL_VALUES],
          description:
            "Volume candle interval. Leave it empty when volume filtering is not used. Supported values: 5m, 10m, 15m, 30m, 1h, 4h, 6h, 12h, 1d.",
        },
        min_quote_volume: {
          type: "string",
          minLength: 1,
          description:
            "Minimum quote volume threshold as a numeric string. Optional unless volume filtering is enabled.",
        },
        vol_volume_multiple: {
          type: "string",
          minLength: 1,
          description:
            "Minimum volume multiple threshold as a numeric string. Optional unless volume filtering is enabled.",
        },
        symbol: {
          type: "integer",
          enum: [CEX_PRICE_SYMBOL_OPERATOR_GTE, CEX_PRICE_SYMBOL_OPERATOR_LTE],
          description: "Comparison operator. 1 means >=, 2 means <=.",
        },
        value: {
          type: "string",
          minLength: 1,
          description:
            "Threshold value as a numeric string. It can represent a percentage or a price.",
        },
        exchanges: {
          type: "array",
          items: {
            type: "string",
            minLength: 1,
          },
          minItems: 1,
          description:
            "Exchange ids to monitor. Supported values: binance, okex, bybit, bitget, gate.",
        },
        notify_interval: {
          type: "integer",
          enum: [
            CEX_NOTIFY_INTERVAL_1M,
            CEX_NOTIFY_INTERVAL_3M,
            CEX_NOTIFY_INTERVAL_5M,
            CEX_NOTIFY_INTERVAL_10M,
            CEX_NOTIFY_INTERVAL_30M,
            CEX_NOTIFY_INTERVAL_1H,
            CEX_NOTIFY_INTERVAL_2H,
            CEX_NOTIFY_INTERVAL_3H,
            CEX_NOTIFY_INTERVAL_4H,
            CEX_NOTIFY_INTERVAL_6H,
            CEX_NOTIFY_INTERVAL_8H,
            CEX_NOTIFY_INTERVAL_10H,
            CEX_NOTIFY_INTERVAL_12H,
            CEX_NOTIFY_INTERVAL_24H,
          ],
          description: "Notification interval in seconds.",
        },
        notify_history_retention: {
          type: "integer",
          enum: [0, 1],
          description: "Whether to retain notify history. Defaults to 1.",
        },
        channels: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description:
            "Notification channel ids. At least one channel id is required.",
        },
      },
      required: [
        "asset_id",
        "monitor_type",
        "monitor_interval",
        "type",
        "symbol",
        "value",
        "exchanges",
        "notify_interval",
        "channels",
      ],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "cex-monitor",
    recommendedBefore: ["cex_asset_search", "notify_channel_list"],
    fieldDescriptions: [...CEX_PRICE_MONITOR_FIELD_DESCRIPTIONS],
    conditionalRules: [
      {
        when: "channels",
        requiredFields: ["channels"],
        message: "channels must contain at least one notification channel id.",
      },
      {
        when: "exchanges",
        requiredFields: ["exchanges"],
        message: "Supported exchanges are binance, okex, bybit, bitget, gate.",
      },
      {
        when: "notify_interval",
        requiredFields: ["notify_interval"],
        message:
          "notify_interval must use one of the supported second values shared by the CEX monitor tools.",
      },
      {
        when: "min_quote_volume or vol_volume_multiple is provided",
        requiredFields: ["vol_interval"],
        message:
          "vol_interval is required only when volume filtering is enabled through min_quote_volume or vol_volume_multiple. support   5m 10m 15m 30m 1h 4h 6h 12h 1d",
      },
    ],
    examples: [
      {
        title: "Create a price monitor for Bitcoin",
        args: {
          apiKey: "user-api-key",
          asset_id: 2,
          monitor_type: 1,
          monitor_interval: 60,
          type: 1,
          symbol: 1,
          value: "10",
          exchanges: ["okex", "binance"],
          notify_interval: 300,
          last_notify: 0,
          notify_history_retention: 1,
          channels: [11331],
          disabled: 0,
        },
      },
      {
        title: "Create a price monitor with volume filtering enabled",
        args: {
          apiKey: "user-api-key",
          asset_id: 2,
          monitor_type: 1,
          monitor_interval: 60,
          type: 1,
          vol_interval: "",
          min_quote_volume: "",
          vol_volume_multiple: "",
          symbol: 1,
          value: "10",
          exchanges: ["okex", "binance"],
          notify_interval: 300,
          last_notify: 0,
          notify_history_retention: 1,
          channels: [11331],
          disabled: 0,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCexPriceSubscriptionCreateArgs(rawArgs, CEX_PRICE_TOOL_SHARED_DEPS);
        const result = await client.createCexPriceSubscription(
          { apiKey: args.apiKey },
          buildCexPriceSubscriptionCreatePayload(args),
        );

        return {
          ok: true,
          created: true,
          subscription: {
            assetId: args.assetId,
            monitorType: args.monitorType,
            monitorInterval: args.monitorInterval,
            type: args.triggerType,
            symbol: args.symbolOperator,
            value: args.value,
            exchanges: args.exchanges,
            notifyInterval: args.notifyInterval,
            notifyHistoryRetention: args.notifyHistoryRetention,
            channels: args.channels,
            disabled: args.disabled,
            ...(args.volInterval ? { volInterval: args.volInterval } : {}),
            ...(args.minQuoteVolume ? { minQuoteVolume: args.minQuoteVolume } : {}),
            ...(args.volVolumeMultiple ? { volVolumeMultiple: args.volVolumeMultiple } : {}),
          },
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_price_subscription_list",
    description:
      "Use this tool when the user wants to inspect the current CEX price monitor subscriptions. This is an authenticated read-only operation that returns normalized pagination metadata and the current subscription list.",
    inputSchema: {
      type: "object",
      properties: {
        index: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Page index. Defaults to 1.",
        },
        limit: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Maximum number of subscriptions to return. Defaults to 20.",
        },
        desc: {
          type: "boolean",
          description: "Whether to sort in descending order. Defaults to true.",
        },
      },
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "cex-monitor",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "List the first page of price monitor subscriptions",
        args: {
          apiKey: "user-api-key",
          index: 1,
          limit: 20,
          desc: true,
        },
      },
    ],
    fieldDescriptions: [...CEX_PRICE_MONITOR_FIELD_DESCRIPTIONS],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCexPriceSubscriptionListArgs(rawArgs);
        const response = await client.listCexPriceSubscriptions(
          { apiKey: args.apiKey },
          { index: args.index, limit: args.limit, desc: args.desc },
        );
        return {
          ok: true,
          count: response.subscriptions.length,
          page: normalizeSubscriptionPage(response.page),
          subscriptions: response.subscriptions.map((item) => normalizePriceSubscription(item)),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_price_subscription_set_disabled",
    description:
      "Use this tool only when the user explicitly wants to enable or disable one or more CEX price monitor subscriptions. This is an authenticated write operation with side effects.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        ids: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description:
            "Price monitor subscription ids to enable or disable. Supports updating multiple ids in one request.",
        },
        disable: {
          type: "boolean",
          description:
            "Whether to disable the subscriptions. true disables them, false enables them.",
        },
      },
      required: ["apiKey", "ids", "disable"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "cex-monitor",
    recommendedBefore: ["cex_price_subscription_list"],
    conditionalRules: [],
    examples: [
      {
        title: "Disable one or more price monitor subscriptions",
        args: {
          apiKey: "user-api-key",
          ids: [6, 7],
          disable: true,
        },
      },
      {
        title: "Enable one or more price monitor subscriptions",
        args: {
          apiKey: "user-api-key",
          ids: [6, 7],
          disable: false,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCexPriceSubscriptionSetDisabledArgs(rawArgs);
        const result = await client.setCexPriceSubscriptionsDisabled(
          { apiKey: args.apiKey },
          buildCexPriceSubscriptionSetDisabledPayload(args),
        );
        return {
          ok: true,
          ids: args.ids,
          disabled: args.disable,
          updated: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_price_subscription_delete",
    description:
      "Use this tool only when the user explicitly wants to delete one or more CEX price monitor subscriptions. This is an authenticated write operation with side effects.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        ids: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description:
            "Price monitor subscription ids to delete. Supports deleting multiple ids in one request.",
        },
      },
      required: ["apiKey", "ids"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "dangerous",
    category: "cex-monitor",
    recommendedBefore: ["cex_price_subscription_list"],
    conditionalRules: [],
    examples: [
      {
        title: "Delete one or more price monitor subscriptions by id",
        args: {
          apiKey: "user-api-key",
          ids: [39, 40],
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCexPriceSubscriptionDeleteArgs(rawArgs);
        const result = await client.deleteCexPriceSubscriptions(
          { apiKey: args.apiKey },
          buildCexPriceSubscriptionDeletePayload(args),
        );
        return {
          ok: true,
          ids: args.ids,
          deleted: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
];

// createCexPriceToolExecutors 创建 CEX 资产搜索与价格监控相关的本地直连工具执行器。
export function createCexPriceToolExecutors(client: AlertDogClient): ToolExecutorMap {
  return createExecutorsFromRegistrations(client, CEX_PRICE_TOOL_REGISTRATIONS);
}

export const CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS: AlertDogToolRegistration<AlertDogClient>[] = [
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_offical_candle_signal_feed_list",
    description:
      "Use this tool when the user wants to inspect the latest official CEX candle signal feed entries. This is an authenticated read-only operation that returns normalized pagination metadata and a list of current candle signal feed items.",
    inputSchema: {
      type: "object",
      properties: {
        next: {
          type: "integer",
          description:
            "Pagination cursor. Use -1 for the first page, or pass the previous response page.next value to continue.",
        },
        limit: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Maximum number of feed items to return. Defaults to 10.",
        },
        desc: {
          type: "boolean",
          description: "Whether to sort in descending order. Defaults to true.",
        },
      },
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "cex-monitor",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "Read the first page of official candle signal feed items",
        args: {
          apiKey: "user-api-key",
        },
      },
      {
        title: "Read the next page with a returned cursor",
        args: {
          apiKey: "user-api-key",
          next: 7724,
          limit: 10,
          desc: true,
        },
      },
    ],
    responseFieldDescriptions: [...CEX_CANDLE_SIGNAL_FEED_RESPONSE_FIELD_DESCRIPTIONS],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalFeedListArgs(rawArgs);
        const response = await client.listCexCandleSignalFeeds(
          { apiKey: args.apiKey },
          { next: args.next, limit: args.limit, desc: args.desc },
        );

        return {
          ok: true,
          count: response.signals.length,
          page: normalizeFeedPage(response.page),
          signals: response.signals.map(toSignalPayload),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_candle_signal_subscription_create",
    description:
      "Use this tool only when the user explicitly wants to create an official CEX candle signal subscription. This is an authenticated write operation with side effects. It creates a monitor subscription using the specified interval, volume thresholds, direction, exchanges, notify interval, and notification channels.",
    inputSchema: {
      type: "object",
      properties: {
        interval: {
          type: "string",
          enum: [...CEX_CANDLE_SIGNAL_INTERVAL_VALUES],
          description:
            "Candle interval. Supported values: 5m, 10m, 15m, 30m, 1h, 4h, 6h, 12h, 1d.",
        },
        min_quote_volume: {
          type: "string",
          minLength: 1,
          description: "Minimum quote volume threshold as a numeric string.",
        },
        min_volume_multiple: {
          type: "string",
          minLength: 1,
          description:
            "Minimum current volume divided by historical average volume as a numeric string.",
        },
        min_abs_change_pct: {
          type: "string",
          minLength: 1,
          description: "Minimum absolute percentage price change as a numeric string.",
        },
        direction: {
          type: "integer",
          enum: [
            CEX_CANDLE_SIGNAL_DIRECTION_BOTH,
            CEX_CANDLE_SIGNAL_DIRECTION_UP,
            CEX_CANDLE_SIGNAL_DIRECTION_DOWN,
          ],
          description:
            "Signal direction. 1 means both directions, 2 means upward only, 3 means downward only.",
        },
        exchanges: {
          type: "array",
          items: {
            type: "string",
            minLength: 1,
          },
          minItems: 1,
          description: "Exchange ids to monitor, such as okex or binance.",
        },
        notify_interval: {
          type: "integer",
          enum: [
            CEX_NOTIFY_INTERVAL_1M,
            CEX_NOTIFY_INTERVAL_3M,
            CEX_NOTIFY_INTERVAL_5M,
            CEX_NOTIFY_INTERVAL_10M,
            CEX_NOTIFY_INTERVAL_30M,
            CEX_NOTIFY_INTERVAL_1H,
            CEX_NOTIFY_INTERVAL_2H,
            CEX_NOTIFY_INTERVAL_3H,
            CEX_NOTIFY_INTERVAL_4H,
            CEX_NOTIFY_INTERVAL_6H,
            CEX_NOTIFY_INTERVAL_8H,
            CEX_NOTIFY_INTERVAL_10H,
            CEX_NOTIFY_INTERVAL_12H,
            CEX_NOTIFY_INTERVAL_24H,
          ],
          description:
            "Per Token Notification interval in seconds. Supported values are 60, 180, 300, 600, 1800, 3600, 7200, 10800, 14400, 21600, 28800, 36000, 43200, 86400.",
        },
        channels: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description: "Notification channel ids. At least one channel id is required.",
        },
        disabled: {
          type: "integer",
          enum: [0, 1],
          description: "Whether the subscription is disabled on creation. Defaults to 0.",
        },
      },
      required: [
        "interval",
        "min_quote_volume",
        "min_volume_multiple",
        "min_abs_change_pct",
        "direction",
        "exchanges",
        "notify_interval",
        "channels",
      ],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "cex-monitor",
    recommendedBefore: ["notify_channel_list", "cex_offical_candle_signal_feed_list"],
    conditionalRules: [
      {
        when: "min_quote_volume",
        requiredFields: ["min_quote_volume"],
        message: "Must greater than 10000",
      },
      {
        when: "notify_interval",
        requiredFields: ["notify_interval"],
        message:
          "notify_interval must be one of the supported second values: 60, 180, 300, 600, 1800, 3600, 7200, 10800, 14400, 21600, 28800, 36000, 43200, 86400.",
      },
      {
        when: "channels",
        requiredFields: ["channels"],
        message: "channels must contain at least one notification channel id.",
      },
      {
        when: "exchanges",
        requiredFields: ["exchanges"],
        message: "Support Binance, Okex, ByBit, Bitget",
      },
    ],
    examples: [
      {
        title: "Create a Binance and OKX candle signal subscription",
        args: {
          apiKey: "user-api-key",
          interval: "5m",
          min_quote_volume: "10000",
          min_volume_multiple: "3",
          min_abs_change_pct: "2",
          direction: 1,
          exchanges: ["okex", "binance", "bybit", "bitget"],
          notify_interval: 300,
          channels: [1, 2],
          disabled: 0,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalSubscriptionCreateArgs(
          rawArgs,
          CEX_CANDLE_SIGNAL_TOOL_SHARED_DEPS,
        );
        const payload = buildCandleSignalSubscriptionCreatePayload(args);
        const result = await client.createCexCandleSignalSubscription(
          { apiKey: args.apiKey },
          payload,
        );

        return {
          ok: true,
          created: true,
          subscription: {
            interval: args.interval,
            minQuoteVolume: args.minQuoteVolume,
            minVolumeMultiple: args.minVolumeMultiple,
            minAbsChangePct: args.minAbsChangePct,
            direction: args.direction,
            exchanges: args.exchanges,
            notifyInterval: args.notifyInterval,
            channels: args.channels,
            disabled: args.disabled,
          },
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_candle_signal_subscription_update",
    description:
      "Use this tool only when the user explicitly wants to update an existing official CEX candle signal subscription. This is an authenticated write operation with side effects. It updates the specified subscription using the same fields as create, and id is required.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Subscription id to update.",
        },
        interval: {
          type: "string",
          enum: [...CEX_CANDLE_SIGNAL_INTERVAL_VALUES],
          description:
            "Candle interval. Supported values: 5m, 10m, 15m, 30m, 1h, 4h, 6h, 12h, 1d.",
        },
        min_quote_volume: {
          type: "string",
          minLength: 1,
          description: "Minimum quote volume threshold as a numeric string.",
        },
        min_volume_multiple: {
          type: "string",
          minLength: 1,
          description:
            "Minimum current volume divided by historical average volume as a numeric string.",
        },
        min_abs_change_pct: {
          type: "string",
          minLength: 1,
          description: "Minimum absolute percentage price change as a numeric string.",
        },
        direction: {
          type: "integer",
          enum: [
            CEX_CANDLE_SIGNAL_DIRECTION_BOTH,
            CEX_CANDLE_SIGNAL_DIRECTION_UP,
            CEX_CANDLE_SIGNAL_DIRECTION_DOWN,
          ],
          description:
            "Signal direction. 1 means both directions, 2 means upward only, 3 means downward only.",
        },
        exchanges: {
          type: "array",
          items: {
            type: "string",
            minLength: 1,
          },
          minItems: 1,
          description: "Exchange ids to monitor, such as okex or binance.",
        },
        notify_interval: {
          type: "integer",
          enum: [
            CEX_NOTIFY_INTERVAL_1M,
            CEX_NOTIFY_INTERVAL_3M,
            CEX_NOTIFY_INTERVAL_5M,
            CEX_NOTIFY_INTERVAL_10M,
            CEX_NOTIFY_INTERVAL_30M,
            CEX_NOTIFY_INTERVAL_1H,
            CEX_NOTIFY_INTERVAL_2H,
            CEX_NOTIFY_INTERVAL_3H,
            CEX_NOTIFY_INTERVAL_4H,
            CEX_NOTIFY_INTERVAL_6H,
            CEX_NOTIFY_INTERVAL_8H,
            CEX_NOTIFY_INTERVAL_10H,
            CEX_NOTIFY_INTERVAL_12H,
            CEX_NOTIFY_INTERVAL_24H,
          ],
          description:
            "Per Token Notification interval in seconds. Supported values are 60, 180, 300, 600, 1800, 3600, 7200, 10800, 14400, 21600, 28800, 36000, 43200, 86400.",
        },
        channels: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description: "Notification channel ids. At least one channel id is required.",
        },
        disabled: {
          type: "integer",
          enum: [0, 1],
          description: "Whether the subscription is disabled after update. Defaults to 0.",
        },
      },
      required: [
        "id",
        "interval",
        "min_quote_volume",
        "min_volume_multiple",
        "min_abs_change_pct",
        "direction",
        "exchanges",
        "notify_interval",
        "channels",
      ],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "cex-monitor",
    recommendedBefore: ["cex_candle_signal_subscription_list"],
    conditionalRules: [
      {
        when: "id",
        requiredFields: ["id"],
        message: "id is required when updating an existing candle signal subscription.",
      },
      {
        when: "min_quote_volume",
        requiredFields: ["min_quote_volume"],
        message: "Must greater than 10000",
      },
      {
        when: "notify_interval",
        requiredFields: ["notify_interval"],
        message:
          "notify_interval must be one of the supported second values: 60, 180, 300, 600, 1800, 3600, 7200, 10800, 14400, 21600, 28800, 36000, 43200, 86400.",
      },
      {
        when: "channels",
        requiredFields: ["channels"],
        message: "channels must contain at least one notification channel id.",
      },
      {
        when: "exchanges",
        requiredFields: ["exchanges"],
        message: "Support Binance, Okex, ByBit, Bitget",
      },
    ],
    examples: [
      {
        title: "Update an existing Binance and OKX candle signal subscription",
        args: {
          apiKey: "user-api-key",
          id: 12,
          interval: "5m",
          min_quote_volume: "10000",
          min_volume_multiple: "3",
          min_abs_change_pct: "2",
          direction: 1,
          exchanges: ["okex", "binance", "bybit", "bitget"],
          notify_interval: 300,
          channels: [1, 2],
          disabled: 0,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalSubscriptionUpdateArgs(
          rawArgs,
          CEX_CANDLE_SIGNAL_TOOL_SHARED_DEPS,
        );
        const payload = buildCandleSignalSubscriptionUpdatePayload(args);
        const result = await client.updateCexCandleSignalSubscription(
          { apiKey: args.apiKey },
          payload,
        );

        return {
          ok: true,
          updated: true,
          subscription: {
            id: args.id,
            interval: args.interval,
            minQuoteVolume: args.minQuoteVolume,
            minVolumeMultiple: args.minVolumeMultiple,
            minAbsChangePct: args.minAbsChangePct,
            direction: args.direction,
            exchanges: args.exchanges,
            notifyInterval: args.notifyInterval,
            channels: args.channels,
            disabled: args.disabled,
          },
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_candle_signal_subscription_list",
    description:
      "Use this tool when the user wants to inspect the current official CEX candle signal subscriptions. This is an authenticated read-only operation that returns normalized pagination metadata and the current subscription list.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        index: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Page index. Defaults to 1.",
        },
        limit: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Maximum number of subscriptions to return. Defaults to 20.",
        },
        desc: {
          type: "boolean",
          description: "Whether to sort in descending order. Defaults to true.",
        },
      },
      required: ["apiKey"],
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "cex-monitor",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "List the first page of official candle signal subscriptions",
        args: {
          apiKey: "user-api-key",
          index: 1,
          limit: 20,
          desc: true,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalSubscriptionListArgs(rawArgs);
        const response = await client.listCexCandleSignalSubscriptions(
          { apiKey: args.apiKey },
          { index: args.index, limit: args.limit, desc: args.desc },
        );

        return {
          ok: true,
          count: response.subscriptions.length,
          page: normalizeCandleSignalSubscriptionPage(response.page),
          subscriptions: response.subscriptions.map((item) => normalizeCandleSignalSubscriptionListPayload(item)),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_candle_signal_subscription_notify_history_list",
    description:
      "Use this tool when the user wants to inspect notification trigger history generated by the user's own CEX candle signal subscriptions. This is an authenticated read-only operation that returns normalized personal subscription history items together with prev and next cursors. When subscribe_id is omitted, it returns notification history across all subscriptions owned by the current user.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        subscribe_id: {
          type: "integer",
          exclusiveMinimum: 0,
          description:
            "Optional personal subscription id filter. When omitted, the tool returns notification history across all subscriptions owned by the current user.",
        },
        cursor: {
          type: "integer",
          minimum: 0,
          description: "User subscription history cursor. Defaults to 0 for the latest page.",
        },
        limit: {
          type: "integer",
          exclusiveMinimum: 0,
          description: "Maximum number of history records to return. Defaults to 100.",
        },
        desc: {
          type: "boolean",
          description: "Whether to sort in descending order. Defaults to true.",
        },
        pageFlip: {
          type: "string",
          enum: ["prev", "next"],
          description:
            "Optional paging direction. Omit pageFlip for the default latest query. Use prev with cursor=page.prev to move upward and fetch newer/latest data, or use next with cursor=page.next to move downward and fetch older data.",
        },
      },
      required: ["apiKey"],
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "cex-monitor",
    recommendedBefore: ["cex_candle_signal_subscription_list"],
    conditionalRules: [
      {
        when: "subscribe_id is provided",
        requiredFields: ["subscribe_id"],
        message:
          "Use subscribe_id when you want to read trigger history for one specific user subscription only.",
      },
      {
        when: "subscribe_id is omitted",
        requiredFields: [],
        message:
          "When subscribe_id is omitted, the tool returns notification history across all candle signal subscriptions owned by the current user.",
      },
      {
        when: "pageFlip is omitted",
        requiredFields: [],
        message:
          "Omit pageFlip and set cursor=0 for initialization or when you only need the latest snapshot.",
      },
      {
        when: "pageFlip=prev",
        requiredFields: ["pageFlip"],
        message:
          "Use pageFlip=prev when you want real-time monitoring or incremental updates. Reuse the previous response page.prev as cursor. If no new data is returned, keep the old cursor value.",
      },
      {
        when: "pageFlip=next",
        requiredFields: ["pageFlip"],
        message:
          "Use pageFlip=next when you want to fetch all history from newest to oldest. Reuse the previous response page.next as cursor. If no additional history is returned, keep the old cursor value.",
      },
    ],
    examples: [
      {
        title: "Read the default latest user subscription notification history page",
        args: {
          apiKey: "user-api-key",
          subscribe_id: 12,
          cursor: 0,
          limit: 100,
          desc: true,
        },
        response: {
          ok: true,
          count: 1,
          page: {
            pageFlip: "prev",
            limit: 1,
            prev: 8,
            next: 8,
            latestCursor: 8,
            olderCursor: 8,
            latestCursorUsage:
              "Use page.prev to fetch the latest available history page.",
            olderCursorUsage:
              "Use page.next to fetch older history records.",
          },
          history: [
            {
              id: 8,
              userId: 27,
              subscribeId: 12,
              assetId: 4579,
              asset: {
                id: 4579,
                symbol: "TUNA",
                slug: "tuna",
                name: "Tuna",
                icon: "https://cdn.example/tuna.png",
              },
              cexCoinPriceId: 1263,
              exchange: "bybit",
              baseSymbol: "TUNA",
              rawSymbol: "TUNAUSDT",
              interval: "5m",
              candleStartAt: "2026-04-09T17:25:00+08:00",
              candleEndAt: "2026-04-09T17:29:59.999+08:00",
              price: "0.01446",
              changePct: "1.54494382022472",
              avgQuoteVolume: "78.3620206666666667",
              volumeMultiple: "179.3077248450399411",
              quoteVolume: "14050.91564",
              expireAt: "2026-04-10T17:29:59.999+08:00",
              createdAt: "2026-04-09T17:28:26.102+08:00",
              updatedAt: "2026-04-09T17:28:26.102+08:00",
              spots: [
                {
                  id: 3504,
                  exchange: "bybit",
                  symbol: "TUNA",
                  assetId: 4579,
                  delisted: false,
                  cexCoinSpotPrice: {
                    exchange: "bybit",
                    quote: "USDT",
                    rawSymbol: "TUNAUSDT",
                    marketPrice: "0.01472",
                    state: 1,
                    change1m: "-0.19",
                    change5m: "1.93",
                    change15m: "16.24",
                    change30m: "-0.79",
                    change1h: "-7.05",
                    change4h: "-4.04",
                    change12h: "-75.77",
                    change1d: "-75.28",
                  },
                },
              ],
              futures: [
                {
                  id: 441,
                  exchange: "bybit",
                  symbol: "TUNA",
                  assetId: 4579,
                  cexFutureCoinPrice: {
                    exchange: "bybit",
                    quote: "USDT",
                    realQuote: "USDT",
                    rawSymbol: "TUNAUSDT",
                    markPrice: "0.01480",
                    fundingRate: "0.004605",
                    state: 1,
                    change1m: "-0.10",
                    change5m: "1.20",
                    change15m: "3.50",
                    change30m: "4.20",
                    change1h: "5.10",
                    change4h: "-2.10",
                    change12h: "-70.10",
                    change1d: "-69.50",
                  },
                },
              ],
            },
          ],
        },
      },
      {
        title: "Read notification history across all subscriptions owned by the current user",
        args: {
          apiKey: "user-api-key",
          cursor: 0,
          limit: 100,
          desc: true,
        },
        notes:
          "Initialization mode: leave pageFlip empty and set cursor=0 to read the latest notification history across all personal candle signal subscriptions.",
      },
      {
        title: "Read incremental user subscription trigger updates",
        args: {
          apiKey: "user-api-key",
          subscribe_id: 12,
          cursor: 8,
          limit: 100,
          desc: true,
          pageFlip: "prev",
        },
        notes:
          "For real-time monitoring or incremental polling, pass the previous response page.prev as cursor and set pageFlip=prev. If no new data is returned, keep the previous cursor value unchanged.",
      },
      {
        title: "Read older user subscription trigger history records",
        args: {
          apiKey: "user-api-key",
          cursor: 8,
          limit: 100,
          desc: true,
          pageFlip: "next",
        },
        notes:
          "For full-history backfill, pass the previous response page.next as cursor and set pageFlip=next. If no additional history is returned, keep the previous cursor value unchanged.",
      },
    ],
    responseFieldDescriptions: [...CEX_CANDLE_SIGNAL_HISTORY_RESPONSE_FIELD_DESCRIPTIONS],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalHistoryListArgs(rawArgs);
        const response = await client.listCexCandleSignalHistory(
          { apiKey: args.apiKey },
          {
            ...(args.subscribeId !== undefined ? { subscribeId: args.subscribeId } : {}),
            cursor: args.cursor,
            limit: args.limit,
            desc: args.desc,
            ...(args.pageFlip !== undefined ? { pageFlip: args.pageFlip } : {}),
          },
        );

        return {
          ok: true,
          count: response.history.length,
          page: normalizeHistoryPage(response.page),
          history: response.history.map((item) => toHistoryPayload(item)),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_candle_signal_subscription_set_disabled",
    description:
      "Use this tool only when the user explicitly wants to enable or disable one or more official CEX candle signal subscriptions. This is an authenticated write operation with side effects.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        ids: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description: "Subscription ids to update. At least one id is required.",
        },
        disable: {
          type: "boolean",
          description:
            "Whether to disable the subscriptions. true disables them, false enables them.",
        },
      },
      required: ["apiKey", "ids", "disable"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "cex-monitor",
    recommendedBefore: ["cex_candle_signal_subscription_list"],
    conditionalRules: [
      {
        when: "ids",
        requiredFields: ["ids"],
        message: "ids must contain at least one subscription id.",
      },
    ],
    examples: [
      {
        title: "Disable multiple official candle signal subscriptions",
        args: {
          apiKey: "user-api-key",
          ids: [10, 11],
          disable: true,
        },
      },
      {
        title: "Enable multiple official candle signal subscriptions",
        args: {
          apiKey: "user-api-key",
          ids: [10],
          disable: false,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalSubscriptionSetDisabledArgs(rawArgs);
        const result = await client.setCexCandleSignalSubscriptionsDisabled(
          { apiKey: args.apiKey },
          buildCandleSignalSubscriptionSetDisabledPayload(args),
        );

        return {
          ok: true,
          ids: args.ids,
          disabled: args.disable,
          updated: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "cex_candle_signal_subscription_delete",
    description:
      "Use this tool only when the user explicitly wants to delete one or more official CEX candle signal subscriptions. This is an authenticated write operation with side effects.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        ids: {
          type: "array",
          items: {
            type: "integer",
            exclusiveMinimum: 0,
          },
          minItems: 1,
          description: "Subscription ids to delete. At least one id is required.",
        },
      },
      required: ["apiKey", "ids"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "dangerous",
    category: "cex-monitor",
    recommendedBefore: ["cex_candle_signal_subscription_list"],
    conditionalRules: [
      {
        when: "ids",
        requiredFields: ["ids"],
        message: "ids must contain at least one subscription id.",
      },
    ],
    examples: [
      {
        title: "Delete multiple official candle signal subscriptions",
        args: {
          apiKey: "user-api-key",
          ids: [1, 2, 3],
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeCandleSignalSubscriptionDeleteArgs(rawArgs);
        const result = await client.deleteCexCandleSignalSubscriptions(
          { apiKey: args.apiKey },
          buildCandleSignalSubscriptionDeletePayload(args),
        );

        return {
          ok: true,
          ids: args.ids,
          deleted: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error, "Unknown error");
      }
    },
  }),
];

export const CEX_MONITOR_TOOL_SPECS = [
  ...CEX_PRICE_TOOL_REGISTRATIONS,
  ...CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS,
];

// createCexCandleSignalToolExecutors 创建量价异动相关的本地直连工具执行器。
export function createCexCandleSignalToolExecutors(
  client: AlertDogClient,
): ToolExecutorMap {
  return createExecutorsFromRegistrations(client, CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS);
}
