import type {
  AlertDogCexAssetRecord,
  AlertDogCexCandleSignalFeedAssetRecord,
  AlertDogCexCandleSignalFeedPage,
  AlertDogCexCandleSignalFeedRecord,
  AlertDogCexCandleSignalHistoryFuturePriceRecord,
  AlertDogCexCandleSignalHistoryFutureRecord,
  AlertDogCexCandleSignalHistoryPage,
  AlertDogCexCandleSignalHistoryRecord,
  AlertDogCexCandleSignalHistorySpotPriceRecord,
  AlertDogCexCandleSignalHistorySpotRecord,
  AlertDogCexCandleSignalSubscriptionCreatePayload,
  AlertDogCexCandleSignalSubscriptionDeletePayload,
  AlertDogCexCandleSignalSubscriptionListPage,
  AlertDogCexCandleSignalSubscriptionSetDisabledPayload,
  AlertDogCexCandleSignalSubscriptionUpdatePayload,
  AlertDogCexFutureSettleTimeDiffArbitrageFuturePriceRecord,
  AlertDogCexFutureSettleTimeDiffArbitrageFutureRecord,
  AlertDogCexFutureSettleTimeDiffArbitrageRecord,
  AlertDogCexPriceSubscriptionCreatePayload,
  AlertDogCexPriceSubscriptionDeletePayload,
  AlertDogCexPriceSubscriptionListPage,
  AlertDogCexPriceSubscriptionSetDisabledPayload,
} from "../../../api/alertdog.js";
import type { ToolPayload } from "../../tool-types.js";
import {
  normalizeUnknownValue,
  optionalBoolean,
  optionalInteger,
  optionalNumericString,
  optionalPageFlip,
  optionalPositiveInteger,
  optionalPositiveOrZeroInteger,
  requireBoolean,
  requireEnumNumber,
  requireEnumString,
  requireNumericString,
  requirePositiveInt,
  requirePositiveIntArray,
  requirePositiveOrZeroInt,
  requireString,
  requireStringArray,
  requireZeroOrOne,
} from "./input-tool.js";

export interface CexAssetSearchArgs {
  keyword: string;
  apiKey: string;
}

export interface CexPriceSubscriptionCreateArgs {
  apiKey: string;
  assetId: number;
  monitorType: number;
  monitorInterval: number;
  triggerType: number;
  volInterval?: string;
  minQuoteVolume?: string;
  volVolumeMultiple?: string;
  symbolOperator: number;
  value: string;
  exchanges: string[];
  notifyInterval: number;
  lastNotify: number;
  notifyHistoryRetention: number;
  channels: number[];
  disabled: number;
}

export interface CexPriceSubscriptionListArgs {
  apiKey: string;
  index: number;
  limit: number;
  desc: boolean;
}

export interface CexPriceSubscriptionDeleteArgs {
  apiKey: string;
  ids: number[];
}

export interface CexPriceSubscriptionSetDisabledArgs {
  apiKey: string;
  ids: number[];
  disable: boolean;
}

export interface CexPriceToolSharedDeps {
  monitorTypeValues: readonly number[];
  monitorIntervalValues: readonly number[];
  triggerTypeValues: readonly number[];
  symbolOperatorValues: readonly number[];
  exchangeValues: readonly string[];
  notifyIntervalValues: readonly number[];
  volumeIntervalValues: readonly string[];
}

export interface CexFutureSettleTimeDiffArbitrageListArgs {
  apiKey: string;
  index: number;
  limit: number;
  quote: string;
  assetId: number;
}

export interface CandleSignalFeedListArgs {
  apiKey: string;
  next: number;
  limit: number;
  desc: boolean;
}

export interface CandleSignalSubscriptionCreateArgs {
  apiKey: string;
  interval: string;
  minQuoteVolume: string;
  minVolumeMultiple: string;
  minAbsChangePct: string;
  direction: number;
  exchanges: string[];
  notifyInterval: number;
  channels: number[];
  disabled: number;
}

export interface CandleSignalSubscriptionListArgs {
  apiKey: string;
  index: number;
  limit: number;
  desc: boolean;
}

export interface CandleSignalSubscriptionUpdateArgs extends CandleSignalSubscriptionCreateArgs {
  id: number;
}

export interface CandleSignalHistoryListArgs {
  apiKey: string;
  subscribeId?: number;
  cursor: number;
  limit: number;
  desc: boolean;
  pageFlip?: "prev" | "next";
}

export interface CandleSignalSubscriptionSetDisabledArgs {
  apiKey: string;
  ids: number[];
  disable: boolean;
}

export interface CandleSignalSubscriptionDeleteArgs {
  apiKey: string;
  ids: number[];
}

export interface CexCandleSignalToolSharedDeps {
  intervalValues: readonly string[];
  directionValues: readonly number[];
  notifyIntervalValues: readonly number[];
}

// normalizeCexAssetSearchArgs 校验资产搜索参数。
export function normalizeCexAssetSearchArgs(rawArgs: Record<string, unknown>): CexAssetSearchArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    keyword: requireString(rawArgs.keyword, "keyword"),
  };
}

// normalizeCexPriceSubscriptionCreateArgs 校验价格监控创建参数。
export function normalizeCexPriceSubscriptionCreateArgs(
  rawArgs: Record<string, unknown>,
  deps: CexPriceToolSharedDeps,
): CexPriceSubscriptionCreateArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    assetId: requirePositiveOrZeroInt(rawArgs.asset_id, "asset_id"),
    monitorType: requireEnumNumber(rawArgs.monitor_type, "monitor_type", deps.monitorTypeValues),
    monitorInterval: requireEnumNumber(
      rawArgs.monitor_interval,
      "monitor_interval",
      deps.monitorIntervalValues,
    ),
    triggerType: requireEnumNumber(rawArgs.type, "type", deps.triggerTypeValues),
    symbolOperator: requireEnumNumber(rawArgs.symbol, "symbol", deps.symbolOperatorValues),
    value: requireNumericString(rawArgs.value, "value"),
    exchanges: requireExchangeArray(rawArgs.exchanges, "exchanges", deps.exchangeValues),
    notifyInterval: requireEnumNumber(
      rawArgs.notify_interval,
      "notify_interval",
      deps.notifyIntervalValues,
    ),
    lastNotify: requirePositiveOrZeroInt(rawArgs.last_notify ?? 0, "last_notify"),
    notifyHistoryRetention: requireZeroOrOne(
      rawArgs.notify_history_retention,
      1,
      "notify_history_retention",
    ),
    channels: requirePositiveIntArray(rawArgs.channels, "channels"),
    disabled: requireZeroOrOne(rawArgs.disabled, 0, "disabled"),
    ...normalizeVolumeFilterArgs(rawArgs, deps.volumeIntervalValues),
  };
}

// normalizeCexPriceSubscriptionListArgs 校验并补齐价格监控列表参数。
export function normalizeCexPriceSubscriptionListArgs(
  rawArgs: Record<string, unknown>,
): CexPriceSubscriptionListArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    index: optionalPositiveInteger(rawArgs.index, 1, "index"),
    limit: optionalPositiveInteger(rawArgs.limit, 20, "limit"),
    desc: optionalBoolean(rawArgs.desc, true),
  };
}

// normalizeCexFutureSettleTimeDiffArbitrageListArgs 校验并补齐结算时间差套利查询参数。
export function normalizeCexFutureSettleTimeDiffArbitrageListArgs(
  rawArgs: Record<string, unknown>,
): CexFutureSettleTimeDiffArbitrageListArgs {
  const indexSource =
    rawArgs.index !== undefined && rawArgs.index !== null && rawArgs.index !== ""
      ? rawArgs.index
      : rawArgs.page;

  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    index: optionalPositiveInteger(indexSource, 1, "index"),
    limit: optionalPositiveInteger(rawArgs.limit, 100, "limit"),
    quote: requireString(rawArgs.quote ?? "USDT", "quote"),
    assetId: optionalPositiveOrZeroInteger(rawArgs.assetId ?? rawArgs.asset_id, 0, "assetId"),
  };
}

// normalizeCexPriceSubscriptionDeleteArgs 校验价格监控删除参数。
export function normalizeCexPriceSubscriptionDeleteArgs(
  rawArgs: Record<string, unknown>,
): CexPriceSubscriptionDeleteArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    ids: requirePositiveIntArray(rawArgs.ids, "ids"),
  };
}

// normalizeCexPriceSubscriptionSetDisabledArgs 校验价格监控启用或禁用参数。
export function normalizeCexPriceSubscriptionSetDisabledArgs(
  rawArgs: Record<string, unknown>,
): CexPriceSubscriptionSetDisabledArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    ids: requirePositiveIntArray(rawArgs.ids, "ids"),
    disable: requireBoolean(rawArgs.disable, "disable"),
  };
}

// buildCexPriceSubscriptionCreatePayload 组装价格监控创建请求体。
export function buildCexPriceSubscriptionCreatePayload(
  args: CexPriceSubscriptionCreateArgs,
): AlertDogCexPriceSubscriptionCreatePayload {
  return {
    asset_id: args.assetId,
    monitor_type: args.monitorType,
    monitor_interval: args.monitorInterval,
    type: args.triggerType,
    symbol: args.symbolOperator,
    value: args.value,
    exchanges: args.exchanges,
    notify_interval: args.notifyInterval,
    last_notify: args.lastNotify,
    notify_history_retention: args.notifyHistoryRetention,
    channels: args.channels,
    disabled: args.disabled,
    ...(args.volInterval ? { vol_interval: args.volInterval } : {}),
    ...(args.minQuoteVolume ? { min_quote_volume: args.minQuoteVolume } : {}),
    ...(args.volVolumeMultiple ? { vol_volume_multiple: args.volVolumeMultiple } : {}),
  };
}

// buildCexPriceSubscriptionDeletePayload 组装价格监控删除请求体。
export function buildCexPriceSubscriptionDeletePayload(
  args: CexPriceSubscriptionDeleteArgs,
): AlertDogCexPriceSubscriptionDeletePayload {
  return { ids: args.ids };
}

// buildCexPriceSubscriptionSetDisabledPayload 组装价格监控启用或禁用请求体。
export function buildCexPriceSubscriptionSetDisabledPayload(
  args: CexPriceSubscriptionSetDisabledArgs,
): AlertDogCexPriceSubscriptionSetDisabledPayload {
  return { ids: args.ids, disable: args.disable };
}

// toCexAssetPayload 把资产搜索结果转换成更适合 Agent 消费的结构。
export function toCexAssetPayload(record: AlertDogCexAssetRecord): ToolPayload {
  return {
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.updated_at,
    symbol: record.symbol,
    slug: record.slug,
    name: record.name,
    category: record.category,
    icon: record.icon,
  };
}

// toCexFutureSettleTimeDiffArbitragePayload 把结算时间差套利记录转换成稳定字段结构。
export function toCexFutureSettleTimeDiffArbitragePayload(
  record: AlertDogCexFutureSettleTimeDiffArbitrageRecord,
): ToolPayload {
  return {
    id: record.id, // 套利归档记录 id
    assetId: record.assetId, // AlertDog 资产 id
    asset: record.asset ? toCexAssetPayload(record.asset) : null, // 资产基础信息
    quote: record.quote, // 报价币种
    maxExchange: record.maxExchange, // 结算时间较晚的一侧交易所
    minExchange: record.minExchange, // 结算时间较早的一侧交易所
    minSettleFundingRate: record.minSettleFundingRate, // 较早结算一侧的资金费率
    maxSettleFundingRate: record.maxSettleFundingRate, // 较晚结算一侧的资金费率
    minDiffSec: record.minDiffSec, // 最小结算倒计时，单位秒
    maxDiffSec: record.maxDiffSec, // 最大结算倒计时，单位秒
    minFundingTime: record.minFundingTime ?? null, // 较早一侧的资金费结算时间
    maxFundingTime: record.maxFundingTime ?? null, // 较晚一侧的资金费结算时间
    expectedProfit: record.expectedProfit, // 预估套利收益
    createdAt: record.createdAt, // 记录创建时间
    updatedAt: record.updatedAt, // 记录更新时间
    futures: (record.futures ?? []).map((future) => toCexFutureSettleTimeDiffFuturePayload(future)), // 参与比较的合约市场列表
  };
}

// normalizeSubscriptionPage 把价格监控列表分页信息整理成稳定结构。
export function normalizeSubscriptionPage(
  page: AlertDogCexPriceSubscriptionListPage | null,
): ToolPayload | null {
  if (!page) {
    return null;
  }

  return {
    total: page.total ?? null,
    base: page.base ?? null,
    offset: page.offset ?? null,
    index: page.index ?? null,
    next: page.next ?? null,
    limit: page.limit ?? null,
    desc: page.desc ?? null,
  };
}

// normalizeIndexedSubscriptionPage 按页码/每页数量语义整理分页信息，并在上游缺失时用入参回填。
export function normalizeIndexedSubscriptionPage(
  page: AlertDogCexPriceSubscriptionListPage | null,
  index: number,
  limit: number,
): ToolPayload | null {
  if (!page) {
    return {
      total: null,
      base: null,
      offset: (index - 1) * limit,
      index,
      next: null,
      limit,
      desc: null,
    };
  }

  return {
    total: page.total ?? null,
    base: page.base ?? 0,
    offset: page.offset ?? (index - 1) * limit,
    index: page.index && page.index > 0 ? page.index : index,
    next: page.next ?? null,
    limit: page.limit && page.limit > 0 ? page.limit : limit,
    desc: page.desc ?? null,
  };
}

// normalizePriceSubscription 按真实返回结构归一化价格监控订阅对象。
export function normalizePriceSubscription(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const record = value as Record<string, unknown>;
  const asset = normalizePriceSubscriptionAsset(record.asset);
  const channels = normalizePriceSubscriptionChannels(record.channels);
  return {
    id: record.id ?? null,
    monitorType: record.monitor_type ?? null,
    type: record.type ?? null,
    symbol: record.symbol ?? null,
    value: record.value ?? null,
    exchanges: normalizePriceSubscriptionExchanges(record.exchanges),
    monitorInterval: record.monitor_interval ?? null,
    volInterval: record.vol_interval ?? null,
    minQuoteVolume: record.min_quote_volume ?? null,
    volVolumeMultiple: record.vol_volume_multiple ?? null,
    notifyInterval: record.notify_interval ?? null,
    asset,
    monitorAllAssets: asset === null,
    once: record.once ?? null,
    lastNotify: record.last_notify ?? null,
    notifyHistoryRetention: record.notify_history_retention ?? null,
    channels,
    nextNotifyAt: record.next_notify_at ?? null,
    disabled: record.disabled ?? null,
  };
}

// normalizeCandleSignalFeedListArgs 校验并补齐量价异动 feed 查询参数。
export function normalizeCandleSignalFeedListArgs(
  rawArgs: Record<string, unknown>,
): CandleSignalFeedListArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    next: optionalInteger(rawArgs.next, -1, "next"),
    limit: optionalPositiveInteger(rawArgs.limit, 10, "limit"),
    desc: optionalBoolean(rawArgs.desc, true, "desc"),
  };
}

// normalizeCandleSignalSubscriptionCreateArgs 校验并收窄量价异动订阅创建参数。
export function normalizeCandleSignalSubscriptionCreateArgs(
  rawArgs: Record<string, unknown>,
  deps: CexCandleSignalToolSharedDeps,
): CandleSignalSubscriptionCreateArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    interval: requireInterval(rawArgs.interval, deps.intervalValues),
    minQuoteVolume: requireNumericString(rawArgs.min_quote_volume, "min_quote_volume"),
    minVolumeMultiple: requireNumericString(rawArgs.min_volume_multiple, "min_volume_multiple"),
    minAbsChangePct: requireNumericString(rawArgs.min_abs_change_pct, "min_abs_change_pct"),
    direction: requireDirection(rawArgs.direction, deps.directionValues),
    exchanges: requireStringArray(rawArgs.exchanges, "exchanges"),
    notifyInterval: requireNotifyInterval(rawArgs.notify_interval, deps.notifyIntervalValues),
    channels: requirePositiveIntArray(rawArgs.channels, "channels"),
    disabled: requireZeroOrOne(rawArgs.disabled, 0, "disabled"),
  };
}

// normalizeCandleSignalSubscriptionListArgs 校验并补齐量价异动订阅列表参数。
export function normalizeCandleSignalSubscriptionListArgs(
  rawArgs: Record<string, unknown>,
): CandleSignalSubscriptionListArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    index: optionalPositiveInteger(rawArgs.index, 1, "index"),
    limit: optionalPositiveInteger(rawArgs.limit, 20, "limit"),
    desc: optionalBoolean(rawArgs.desc, true, "desc"),
  };
}

// normalizeCandleSignalSubscriptionUpdateArgs 校验并补齐量价异动订阅更新参数。
export function normalizeCandleSignalSubscriptionUpdateArgs(
  rawArgs: Record<string, unknown>,
  deps: CexCandleSignalToolSharedDeps,
): CandleSignalSubscriptionUpdateArgs {
  const createArgs = normalizeCandleSignalSubscriptionCreateArgs(rawArgs, deps);
  return {
    ...createArgs,
    id: requirePositiveInt(rawArgs.id, "id"),
  };
}

// normalizeCandleSignalHistoryListArgs 校验并补齐量价异动历史查询参数。
export function normalizeCandleSignalHistoryListArgs(
  rawArgs: Record<string, unknown>,
): CandleSignalHistoryListArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    ...(rawArgs.subscribe_id !== undefined && rawArgs.subscribe_id !== null && rawArgs.subscribe_id !== ""
      ? { subscribeId: requirePositiveInt(rawArgs.subscribe_id, "subscribe_id") }
      : {}),
    cursor: optionalPositiveOrZeroInteger(rawArgs.cursor, 0, "cursor"),
    limit: optionalPositiveInteger(rawArgs.limit, 100, "limit"),
    desc: optionalBoolean(rawArgs.desc, true, "desc"),
    ...(rawArgs.pageFlip !== undefined && rawArgs.pageFlip !== null && rawArgs.pageFlip !== ""
      ? { pageFlip: optionalPageFlip(rawArgs.pageFlip) }
      : {}),
  };
}

// normalizeCandleSignalSubscriptionSetDisabledArgs 校验批量启停量价异动订阅参数。
export function normalizeCandleSignalSubscriptionSetDisabledArgs(
  rawArgs: Record<string, unknown>,
): CandleSignalSubscriptionSetDisabledArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    ids: requirePositiveIntArray(rawArgs.ids, "ids"),
    disable: requireBoolean(rawArgs.disable, "disable"),
  };
}

// normalizeCandleSignalSubscriptionDeleteArgs 校验批量删除量价异动订阅参数。
export function normalizeCandleSignalSubscriptionDeleteArgs(
  rawArgs: Record<string, unknown>,
): CandleSignalSubscriptionDeleteArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    ids: requirePositiveIntArray(rawArgs.ids, "ids"),
  };
}

// buildCandleSignalSubscriptionCreatePayload 组装创建量价异动订阅的真实请求体。
export function buildCandleSignalSubscriptionCreatePayload(
  args: CandleSignalSubscriptionCreateArgs,
): AlertDogCexCandleSignalSubscriptionCreatePayload {
  return {
    interval: args.interval,
    min_quote_volume: args.minQuoteVolume,
    min_volume_multiple: args.minVolumeMultiple,
    min_abs_change_pct: args.minAbsChangePct,
    direction: args.direction,
    exchanges: args.exchanges,
    notify_interval: args.notifyInterval,
    channels: args.channels,
    disabled: args.disabled,
  };
}

// buildCandleSignalSubscriptionUpdatePayload 组装更新量价异动订阅的真实请求体。
export function buildCandleSignalSubscriptionUpdatePayload(
  args: CandleSignalSubscriptionUpdateArgs,
): AlertDogCexCandleSignalSubscriptionUpdatePayload {
  return {
    id: args.id,
    ...buildCandleSignalSubscriptionCreatePayload(args),
  };
}

// buildCandleSignalSubscriptionSetDisabledPayload 组装批量启停量价异动订阅请求体。
export function buildCandleSignalSubscriptionSetDisabledPayload(
  args: CandleSignalSubscriptionSetDisabledArgs,
): AlertDogCexCandleSignalSubscriptionSetDisabledPayload {
  return {
    ids: args.ids,
    disable: args.disable,
  };
}

// buildCandleSignalSubscriptionDeletePayload 组装批量删除量价异动订阅请求体。
export function buildCandleSignalSubscriptionDeletePayload(
  args: CandleSignalSubscriptionDeleteArgs,
): AlertDogCexCandleSignalSubscriptionDeletePayload {
  return {
    ids: args.ids,
  };
}

// normalizeFeedPage 把分页信息整理成更稳定的输出结构。
export function normalizeFeedPage(page: AlertDogCexCandleSignalFeedPage): ToolPayload {
  return {
    total: page.total,
    base: page.base,
    offset: page.offset,
    index: page.index,
    next: page.next,
    limit: page.limit,
    desc: page.desc,
  };
}

// normalizeCandleSignalSubscriptionPage 把订阅列表分页信息整理成稳定结构。
export function normalizeCandleSignalSubscriptionPage(
  page: AlertDogCexCandleSignalSubscriptionListPage | null,
): ToolPayload | null {
  if (!page) {
    return null;
  }

  return {
    total: page.total ?? null,
    base: page.base ?? null,
    offset: page.offset ?? null,
    index: page.index ?? null,
    next: page.next ?? null,
    limit: page.limit ?? null,
    desc: page.desc ?? null,
  };
}

// normalizeHistoryPage 把历史记录分页信息整理成稳定结构。
export function normalizeHistoryPage(page: AlertDogCexCandleSignalHistoryPage): ToolPayload {
  return {
    pageFlip: page.pageFlip,
    limit: page.limit,
    prev: page.prev,
    next: page.next,
    latestCursor: page.prev,
    olderCursor: page.next,
    latestCursorUsage: "Use page.prev to fetch the latest available history page.",
    olderCursorUsage: "Use page.next to fetch older history records.",
  };
}

// toSignalPayload 把上游 feed 记录转换成更适合 Agent 消费的 camelCase 结构。
export function toSignalPayload(record: AlertDogCexCandleSignalFeedRecord): ToolPayload {
  return {
    id: record.id,
    assetId: record.asset_id,
    asset: toAssetPayload(record.asset),
    cexCoinPriceId: record.cex_coin_price_id,
    exchange: record.exchange,
    baseSymbol: record.base_symbol,
    rawSymbol: record.raw_symbol,
    interval: record.interval,
    candleStartAt: record.candle_start_at,
    candleEndAt: record.candle_end_at,
    price: record.price,
    changePct: record.change_pct,
    avgQuoteVolume: record.avg_quote_volume,
    volumeMultiple: record.volume_multiple,
    quoteVolume: record.quote_volume,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// toHistoryPayload 把量价异动历史记录转换成固定字段结构。
export function toHistoryPayload(record: AlertDogCexCandleSignalHistoryRecord): ToolPayload {
  return {
    id: record.id,
    userId: record.user_id,
    subscribeId: record.subscribe_id,
    assetId: record.asset_id,
    asset: record.asset
      ? {
          id: record.asset.id,
          symbol: record.asset.symbol,
          slug: record.asset.slug,
          name: record.asset.name,
          icon: record.asset.icon,
        }
      : null,
    cexCoinPriceId: record.cex_coin_price_id,
    exchange: record.exchange,
    baseSymbol: record.base_symbol,
    rawSymbol: record.raw_symbol,
    interval: record.interval,
    candleStartAt: record.candle_start_at,
    candleEndAt: record.candle_end_at,
    price: record.price,
    changePct: record.change_pct,
    avgQuoteVolume: record.avg_quote_volume,
    volumeMultiple: record.volume_multiple,
    quoteVolume: record.quote_volume,
    expireAt: record.expire_at,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    spots: (record.spots ?? []).map((spot) => toHistorySpotPayload(spot)),
    futures: (record.futures ?? []).map((future) => toHistoryFuturePayload(future)),
  };
}

// normalizeCandleSignalSubscriptionListPayload 把订阅列表项统一转成可直接返回的结构。
export function normalizeCandleSignalSubscriptionListPayload(value: unknown): unknown {
  return normalizeUnknownValue(value);
}

// normalizeVolumeFilterArgs 校验交易量过滤参数，只有启用过滤时才要求传入 vol_interval。
function normalizeVolumeFilterArgs(
  rawArgs: Record<string, unknown>,
  volumeIntervalValues: readonly string[],
): Pick<CexPriceSubscriptionCreateArgs, "volInterval" | "minQuoteVolume" | "volVolumeMultiple"> {
  const minQuoteVolume = optionalNumericString(rawArgs.min_quote_volume, "min_quote_volume");
  const volVolumeMultiple = optionalNumericString(rawArgs.vol_volume_multiple, "vol_volume_multiple");
  const hasVolumeFilter = Boolean(minQuoteVolume || volVolumeMultiple);

  if (!hasVolumeFilter) {
    return {};
  }

  return {
    minQuoteVolume,
    volVolumeMultiple,
    volInterval: requireEnumString(rawArgs.vol_interval, "vol_interval", volumeIntervalValues),
  };
}

// normalizePriceSubscriptionAsset 归一化价格监控订阅里的资产对象，空值表示监控所有资产。
function normalizePriceSubscriptionAsset(value: unknown): ToolPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  return {
    id: record.id ?? null,
    createdAt: record.createdAt ?? null,
    updatedAt: record.updated_at ?? null,
    symbol: record.symbol ?? null,
    slug: record.slug ?? null,
    name: record.name ?? null,
    category: record.category ?? null,
    icon: record.icon ?? null,
  };
}

// normalizePriceSubscriptionExchanges 归一化价格监控订阅里的交易所数组。
function normalizePriceSubscriptionExchanges(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return item;
    }

    const record = item as Record<string, unknown>;
    return {
      id: record.id ?? null,
      subscribeId: record.subscribe_id ?? null,
      exchange: record.exchange ?? null,
    };
  });
}

// normalizePriceSubscriptionChannels 过滤并归一化价格监控订阅里的通知渠道关键信息。
function normalizePriceSubscriptionChannels(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return item;
    }

    const record = item as Record<string, unknown>;
    return {
      id: record.id ?? null,
      userId: record.user_id ?? null,
      channel: record.channel_id ?? null,
      name: record.name ?? null,
      chatId: record.chat_id ?? null,
      lastSend: record.last_send ?? null,
      failedCount: record.failed_count ?? null,
      disabled: record.disabled ?? null,
      disabledReason: record.disabled_reason ?? null,
      isDefault: record.is_default ?? null,
    };
  });
}

// requireExchangeArray 校验交易所数组参数，只允许当前支持的交易所值。
function requireExchangeArray(
  value: unknown,
  fieldName: string,
  exchangeValues: readonly string[],
): string[] {
  const exchanges = requireStringArray(value, fieldName);
  for (const exchange of exchanges) {
    if (!exchangeValues.includes(exchange as never)) {
      throw new Error(`${fieldName} must only contain: ${exchangeValues.join(", ")}`);
    }
  }
  return exchanges;
}

// toCexFutureSettleTimeDiffFuturePayload 把套利记录里的合约市场对象转换成稳定字段结构。
function toCexFutureSettleTimeDiffFuturePayload(
  future: AlertDogCexFutureSettleTimeDiffArbitrageFutureRecord,
): ToolPayload {
  return {
    id: future.id, // 合约币种记录 id
    exchange: future.exchange, // 交易所标识
    symbol: future.symbol, // 资产符号
    name: future.name, // 资产名称
    assetId: future.assetId, // AlertDog 资产 id
    rawSymbol: future.rawSymbol, // 交易所原始合约符号
    mul: future.mul, // 合约乘数
    createdAt: future.createdAt, // 记录创建时间
    updatedAt: future.updatedAt, // 记录更新时间
    futurePrice: future.futurePrice
      ? toCexFutureSettleTimeDiffFuturePricePayload(future.futurePrice)
      : null, // 当前关联的合约价格快照
  };
}

// toCexFutureSettleTimeDiffFuturePricePayload 把套利记录里的合约价格对象转换成稳定字段结构。
function toCexFutureSettleTimeDiffFuturePricePayload(
  price: AlertDogCexFutureSettleTimeDiffArbitrageFuturePriceRecord,
): ToolPayload {
  return {
    id: price.id, // 合约价格记录 id
    exchange: price.exchange, // 交易所标识
    quote: price.quote, // 报价币种
    realQuote: price.real_quote ?? null, // 交易所原始报价币种
    rawSymbol: price.rawSymbol, // 交易所原始交易对符号
    fundingRate: price.fundingRate, // 当前资金费率
    markPrice: price.markPrice, // 当前标记价格
    vol24H: price.vol24H ?? null, // 24 小时成交量
    createdAt: price.createdAt, // 记录创建时间
    updatedAt: price.updatedAt, // 记录更新时间
    nextFundingTime: price.nextFundingTime ?? null, // 下一次资金费结算时间
    lastFundingTime: price.LastFundingTime ?? null, // 上一次资金费结算时间
    fundingInterval: price.fundingInterval ?? null, // 资金费结算间隔，单位小时
    state: price.state, // 市场状态
    change1m: price.change1m, // 1 分钟涨跌幅
    change5m: price.change5m, // 5 分钟涨跌幅
    change15m: price.change15m, // 15 分钟涨跌幅
    change30m: price.change30m, // 30 分钟涨跌幅
    change1h: price.change1h, // 1 小时涨跌幅
    change4h: price.change4h, // 4 小时涨跌幅
    change12h: price.change12h, // 12 小时涨跌幅
    change1d: price.change1d, // 1 天涨跌幅
  };
}

// toAssetPayload 把资产对象转换成精简且稳定的子结构。
function toAssetPayload(
  asset: AlertDogCexCandleSignalFeedAssetRecord | null | undefined,
): ToolPayload | null {
  if (!asset) {
    return null;
  }

  return {
    id: asset.id,
    symbol: asset.symbol,
    slug: asset.slug,
    name: asset.name,
    icon: asset.icon,
  };
}

// toHistorySpotPayload 把历史记录里的现货市场对象转换成固定字段结构。
function toHistorySpotPayload(spot: AlertDogCexCandleSignalHistorySpotRecord): ToolPayload {
  return {
    id: spot.id,
    exchange: spot.exchange,
    symbol: spot.symbol,
    assetId: spot.assetId,
    delisted: spot.delisted,
    cexCoinSpotPrice: spot.cexCoinSpotPrice ? toHistorySpotPricePayload(spot.cexCoinSpotPrice) : null,
  };
}

// toHistorySpotPricePayload 把历史记录里的现货价格对象转换成固定字段结构。
function toHistorySpotPricePayload(
  price: AlertDogCexCandleSignalHistorySpotPriceRecord,
): ToolPayload {
  return {
    exchange: price.exchange,
    quote: price.quote,
    rawSymbol: price.rawSymbol,
    marketPrice: price.marketPrice,
    state: price.state,
    change1m: price.change1m,
    change5m: price.change5m,
    change15m: price.change15m,
    change30m: price.change30m,
    change1h: price.change1h,
    change4h: price.change4h,
    change12h: price.change12h,
    change1d: price.change1d,
  };
}

// toHistoryFuturePayload 把历史记录里的合约市场对象转换成固定字段结构。
function toHistoryFuturePayload(
  future: AlertDogCexCandleSignalHistoryFutureRecord,
): ToolPayload {
  return {
    id: future.id,
    exchange: future.exchange,
    symbol: future.symbol,
    rawSymbol: future.rawSymbol,
    assetId: future.assetId,
    cexFutureCoinPrice: future.cexFutureCoinPrice
      ? toHistoryFuturePricePayload(future.cexFutureCoinPrice)
      : null,
  };
}

// toHistoryFuturePricePayload 把历史记录里的合约价格对象转换成固定字段结构。
function toHistoryFuturePricePayload(
  price: AlertDogCexCandleSignalHistoryFuturePriceRecord,
): ToolPayload {
  return {
    exchange: price.exchange,
    quote: price.quote,
    realQuote: price.realQuote,
    rawSymbol: price.rawSymbol,
    markPrice: price.markPrice,
    fundingRate: price.fundingRate,
    state: price.state,
    change1m: price.change1m,
    change5m: price.change5m,
    change15m: price.change15m,
    change30m: price.change30m,
    change1h: price.change1h,
    change4h: price.change4h,
    change12h: price.change12h,
    change1d: price.change1d,
  };
}

// requireInterval 校验量价异动订阅的 K 线周期参数。
function requireInterval(value: unknown, intervalValues: readonly string[]): string {
  const normalized = requireString(value, "interval");
  if (!intervalValues.includes(normalized)) {
    throw new Error(`interval must be one of: ${intervalValues.join(", ")}`);
  }
  return normalized;
}

// requireDirection 校验量价异动订阅方向参数。
function requireDirection(value: unknown, directionValues: readonly number[]): number {
  const parsed = requirePositiveInt(value, "direction");
  if (!directionValues.includes(parsed)) {
    throw new Error(`direction must be one of: ${directionValues.join(", ")}`);
  }
  return parsed;
}

// requireNotifyInterval 校验通知间隔参数是否属于受支持枚举。
function requireNotifyInterval(value: unknown, notifyIntervalValues: readonly number[]): number {
  const parsed = requirePositiveInt(value, "notify_interval");
  if (!notifyIntervalValues.includes(parsed)) {
    throw new Error(
      `notify_interval must be one of: ${notifyIntervalValues.join(", ")}`,
    );
  }
  return parsed;
}
