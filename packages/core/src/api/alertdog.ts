import type { AlertDogCoreConfig } from "../config.js";
import {
  buildVersionHeaders,
  getAgentClientVersionInfo,
} from "../shared/version-headers.js";

export interface AlertDogUserAPIKeyRecord {
  id: number;
  user_id: number;
  api_key: string;
  created_at?: string;
  updated_at?: string;
}

export interface AlertDogRequestAuth {
  apiKey: string;
}

export interface AlertDogNotifyChannelCreatePayload {
  channel_id: string;
  id?: number;
  name: string;
  chat_id?: string;
  webhook_url?: string;
}

export interface AlertDogNotifyChannelRecord {
  id: number;
  user_id: number;
  channel_id: string;
  webhook_url: string;
  Channel: string;
  username: string;
  name: string;
  chat_id: string;
  email_address: string;
  reg_id: string;
  last_send: number;
  failed_start: number;
  failed_count: number;
  failed_stage: number;
  failed_avail: number;
  disabled: number;
  disabled_reason: string;
  is_default: number;
  tel_bot_tokens: string;
  is_delete: number;
}

export interface AlertDogCexCandleSignalFeedAssetRecord {
  id: number;
  symbol: string;
  slug: string;
  name: string;
  icon: string;
}

export interface AlertDogCexCandleSignalFeedRecord {
  id: number;
  asset_id: number;
  asset?: AlertDogCexCandleSignalFeedAssetRecord | null;
  cex_coin_price_id: number;
  exchange: string;
  base_symbol: string;
  raw_symbol: string;
  interval: string;
  candle_start_at: string;
  candle_end_at: string;
  price: string;
  change_pct: string;
  avg_quote_volume: string;
  volume_multiple: string;
  quote_volume: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertDogCexCandleSignalFeedPage {
  total: number;
  base: number;
  offset: number;
  index: number;
  next: number;
  limit: number;
  desc: boolean;
}

export interface AlertDogCexCandleSignalFeedListResult {
  page: AlertDogCexCandleSignalFeedPage;
  signals: AlertDogCexCandleSignalFeedRecord[];
}

export interface AlertDogCexCandleSignalSubscriptionCreatePayload {
  interval: string;
  min_quote_volume: string;
  min_volume_multiple: string;
  min_abs_change_pct: string;
  direction: number;
  exchanges: string[];
  notify_interval: number;
  channels: number[];
  disabled: number;
}

export interface AlertDogCexCandleSignalSubscriptionUpdatePayload
  extends AlertDogCexCandleSignalSubscriptionCreatePayload {
  id: number;
}

export interface AlertDogCexCandleSignalSubscriptionListPage {
  total?: number;
  base?: number;
  offset?: number;
  index?: number;
  next?: number;
  limit?: number;
  desc?: boolean;
}

export interface AlertDogCexCandleSignalSubscriptionListResult {
  page: AlertDogCexCandleSignalSubscriptionListPage | null;
  subscriptions: unknown[];
}

export interface AlertDogCexCandleSignalHistorySpotPriceRecord {
  exchange: string;
  quote: string;
  rawSymbol: string;
  marketPrice: string;
  state: number;
  change1m?: string;
  change5m?: string;
  change15m?: string;
  change30m?: string;
  change1h?: string;
  change4h?: string;
  change12h?: string;
  change1d?: string;
}

export interface AlertDogCexCandleSignalHistorySpotRecord {
  id: number;
  exchange: string;
  symbol: string;
  assetId: number;
  delisted: boolean;
  cexCoinSpotPrice?: AlertDogCexCandleSignalHistorySpotPriceRecord | null;
}

export interface AlertDogCexCandleSignalHistoryFuturePriceRecord {
  exchange: string;
  quote: string;
  realQuote?: string;
  rawSymbol: string;
  markPrice: string;
  fundingRate?: string;
  state: number;
  change1m?: string;
  change5m?: string;
  change15m?: string;
  change30m?: string;
  change1h?: string;
  change4h?: string;
  change12h?: string;
  change1d?: string;
}

export interface AlertDogCexCandleSignalHistoryFutureRecord {
  id: number;
  exchange: string;
  symbol: string;
  rawSymbol: string;
  assetId: number;
  cexFutureCoinPrice?: AlertDogCexCandleSignalHistoryFuturePriceRecord | null;
}

export interface AlertDogCexCandleSignalHistoryRecord {
  id: number;
  user_id: number;
  subscribe_id: number;
  asset_id: number;
  asset?: AlertDogCexCandleSignalFeedAssetRecord | null;
  cex_coin_price_id: number;
  exchange: string;
  base_symbol: string;
  raw_symbol: string;
  interval: string;
  candle_start_at: string;
  candle_end_at: string;
  price: string;
  change_pct: string;
  avg_quote_volume: string;
  volume_multiple: string;
  quote_volume: string;
  expire_at: string;
  createdAt: string;
  updatedAt: string;
  spots?: AlertDogCexCandleSignalHistorySpotRecord[];
  futures?: AlertDogCexCandleSignalHistoryFutureRecord[];
}

export interface AlertDogCexCandleSignalHistoryPage {
  pageFlip: string;
  limit: number;
  prev: number;
  next: number;
}

export interface AlertDogCexCandleSignalHistoryListResult {
  page: AlertDogCexCandleSignalHistoryPage;
  history: AlertDogCexCandleSignalHistoryRecord[];
}

export interface AlertDogCexCandleSignalSubscriptionSetDisabledPayload {
  ids: number[];
  disable: boolean;
}

export interface AlertDogCexCandleSignalSubscriptionDeletePayload {
  ids: number[];
}

export interface AlertDogCexAssetRecord {
  id: number;
  createdAt: string;
  updated_at: string;
  symbol: string;
  slug: string;
  name: string;
  category: string;
  icon: string;
}

export interface AlertDogCexFutureSettleTimeDiffArbitrageFuturePriceRecord {
  id: number; // 合约价格记录 id
  exchange: string; // 交易所标识
  quote: string; // 报价币种
  real_quote?: string; // 交易所原始报价币种
  rawSymbol: string; // 交易所原始交易对符号
  fundingRate: string; // 当前资金费率
  markPrice: string; // 当前标记价格
  vol24H?: string; // 24 小时成交量
  createdAt: string; // 记录创建时间
  updatedAt: string; // 记录更新时间
  nextFundingTime?: string | null; // 下一次资金费结算时间
  LastFundingTime?: string | null; // 上一次资金费结算时间
  fundingInterval?: number | null; // 资金费结算间隔，单位小时
  state: number; // 市场状态
  change1m?: string; // 1 分钟涨跌幅
  change5m?: string; // 5 分钟涨跌幅
  change15m?: string; // 15 分钟涨跌幅
  change30m?: string; // 30 分钟涨跌幅
  change1h?: string; // 1 小时涨跌幅
  change4h?: string; // 4 小时涨跌幅
  change12h?: string; // 12 小时涨跌幅
  change1d?: string; // 1 天涨跌幅
}

export interface AlertDogCexFutureSettleTimeDiffArbitrageFutureRecord {
  id: number; // 合约币种记录 id
  exchange: string; // 交易所标识
  symbol: string; // 资产符号
  name: string; // 资产名称
  assetId: number; // AlertDog 资产 id
  rawSymbol: string; // 交易所原始合约符号
  mul: number; // 合约乘数
  createdAt: string; // 记录创建时间
  updatedAt: string; // 记录更新时间
  futurePrice?: AlertDogCexFutureSettleTimeDiffArbitrageFuturePriceRecord | null; // 当前关联的合约价格快照
}

export interface AlertDogCexFutureSettleTimeDiffArbitrageRecord {
  id: number; // 套利归档记录 id
  assetId: number; // AlertDog 资产 id
  asset?: AlertDogCexAssetRecord | null; // 资产基础信息
  quote: string; // 报价币种
  maxExchange: string; // 结算时间较晚的一侧交易所
  minExchange: string; // 结算时间较早的一侧交易所
  minSettleFundingRate: number; // 较早结算一侧的资金费率
  maxSettleFundingRate: number; // 较晚结算一侧的资金费率
  minDiffSec: number; // 最小结算倒计时，单位秒
  maxDiffSec: number; // 最大结算倒计时，单位秒
  minFundingTime?: string | null; // 较早一侧的资金费结算时间
  maxFundingTime?: string | null; // 较晚一侧的资金费结算时间
  expectedProfit: number; // 预估套利收益
  createdAt: string; // 记录创建时间
  updatedAt: string; // 记录更新时间
  futures?: AlertDogCexFutureSettleTimeDiffArbitrageFutureRecord[] | null; // 参与比较的合约市场列表
}

export interface AlertDogCexFutureSettleTimeDiffArbitrageListResult {
  page: AlertDogCexPriceSubscriptionListPage | null; // 分页信息
  records: AlertDogCexFutureSettleTimeDiffArbitrageRecord[]; // 当前页套利记录列表
}

export interface AlertDogCexPriceSubscriptionCreatePayload {
  asset_id: number;
  monitor_type: number;
  monitor_interval: number;
  type: number;
  vol_interval?: string;
  min_quote_volume?: string;
  vol_volume_multiple?: string;
  symbol: number;
  value: string;
  exchanges: string[];
  notify_interval: number;
  last_notify: number;
  notify_history_retention: number;
  channels: number[];
  disabled: number;
}

export interface AlertDogCexPriceSubscriptionListPage {
  total?: number;
  base?: number;
  offset?: number;
  index?: number;
  next?: number;
  limit?: number;
  desc?: boolean;
}

export interface AlertDogCexPriceSubscriptionListResult {
  page: AlertDogCexPriceSubscriptionListPage | null;
  subscriptions: unknown[];
}

export interface AlertDogCexPriceSubscriptionSetDisabledPayload {
  ids: number[];
  disable: boolean;
}

export interface AlertDogCexPriceSubscriptionDeletePayload {
  ids: number[];
}

interface AlertDogSuccessResponse<T> {
  code?: number;
  result: string;
  data: T;
}

interface AlertDogFailureResponse {
  code?: number;
  result?: string;
  message?: string;
}

interface AlertDogPageResponse<T> extends AlertDogSuccessResponse<T> {
  page: AlertDogCexCandleSignalFeedPage;
}

interface AlertDogCexCandleSignalHistoryResponse {
  code?: number;
  page: AlertDogCexCandleSignalHistoryPage;
  result: AlertDogCexCandleSignalHistoryRecord[];
}

// isSuccessPageResponse 判断带分页信息的 AlertDog 返回是否为成功结构。
function isSuccessPageResponse<T>(
  payload: AlertDogPageResponse<T> | AlertDogFailureResponse,
): payload is AlertDogPageResponse<T> {
  return (
    "page" in payload &&
    "data" in payload &&
    (payload.code === 0 || payload.result === "Success")
  );
}

// isSuccessCexCandleSignalHistoryResponse 判断量价异动历史接口是否返回成功结构。
function isSuccessCexCandleSignalHistoryResponse(
  payload: AlertDogCexCandleSignalHistoryResponse | AlertDogFailureResponse,
): payload is AlertDogCexCandleSignalHistoryResponse {
  return (
    "page" in payload &&
    "result" in payload &&
    (payload.code === 0 || payload.result !== undefined)
  );
}

// isSuccessResponse 判断 AlertDog 返回是否为成功结构。
function isSuccessResponse<T>(
  payload: AlertDogSuccessResponse<T> | AlertDogFailureResponse,
): payload is AlertDogSuccessResponse<T> {
  return "data" in payload && (payload.code === 0 || payload.result === "Success");
}

// extractAlertDogResponseData 统一提取成功响应的数据，兼容不同后端返回格式。
export function extractAlertDogResponseData<T>(
  payload: AlertDogSuccessResponse<T> | AlertDogFailureResponse,
): T {
  if (isSuccessResponse(payload)) {
    return payload.data;
  }

  throw new AlertDogClientError(
    "api",
    payload.message ?? payload.result ?? "AlertDog 业务请求失败",
    { apiCode: payload.code },
  );
}

// AlertDogClientError 表示访问 AlertDog API 时的可识别错误。
export class AlertDogClientError extends Error {
  readonly kind: "http" | "api" | "network";
  readonly status?: number;
  readonly apiCode?: number;

  // constructor 创建一个携带上下文的 AlertDog 客户端错误。
  constructor(
    kind: "http" | "api" | "network",
    message: string,
    options?: { status?: number; apiCode?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "AlertDogClientError";
    this.kind = kind;
    this.status = options?.status;
    this.apiCode = options?.apiCode;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

// AlertDogClient 负责直接访问 AlertDog REST API。
export class AlertDogClient {
  readonly #config: AlertDogCoreConfig;

  // constructor 注入本地直连运行所需配置。
  constructor(config: AlertDogCoreConfig) {
    this.#config = config;
  }

  // getUserAPIKey 使用用户提供的 apikey 获取当前 apikey 信息。
  async getUserAPIKey(auth: AlertDogRequestAuth): Promise<AlertDogUserAPIKeyRecord> {
    return this.request<AlertDogUserAPIKeyRecord>(
      "GET",
      "/mcp/api_key/get",
      auth,
    );
  }

  // createUserAPIKey 使用用户提供的 apikey 为当前账户创建新的 apikey。
  async createUserAPIKey(auth: AlertDogRequestAuth): Promise<AlertDogUserAPIKeyRecord> {
    return this.request<AlertDogUserAPIKeyRecord>(
      "POST",
      "/mcp/api_key/create",
      auth,
    );
  }

  // regenerateUserAPIKey 使用用户提供的 apikey 重新生成新的 apikey。
  async regenerateUserAPIKey(
    auth: AlertDogRequestAuth,
  ): Promise<AlertDogUserAPIKeyRecord> {
    return this.request<AlertDogUserAPIKeyRecord>(
      "POST",
      "/mcp/api_key/regenerate",
      auth,
    );
  }

  // listNotifyChannels 使用用户提供的 apikey 获取通知频道列表。
  async listNotifyChannels(auth: AlertDogRequestAuth): Promise<AlertDogNotifyChannelRecord[]> {
    return this.requestFromMctBackend<AlertDogNotifyChannelRecord[]>(
      "GET",
      "/notify/channel/list",
      auth,
    );
  }

  // createNotifyChannel 使用用户提供的 apikey 创建通知频道。
  async createNotifyChannel(
    auth: AlertDogRequestAuth,
    payload: AlertDogNotifyChannelCreatePayload,
  ): Promise<unknown> {
    return this.requestFromMctBackend<unknown>(
      "POST",
      "/notify/channel/create",
      auth,
      payload,
    );
  }

  // getNotifyChannelBoundMonitorCount 查询通知频道已绑定的监控数量。
  async getNotifyChannelBoundMonitorCount(
    auth: AlertDogRequestAuth,
    id: number,
  ): Promise<unknown> {
    return this.request<unknown>(
      "GET",
      `/monitor/wallet/channel/status/bind/subscribe?id=${encodeURIComponent(String(id))}`,
      auth,
    );
  }

  // deleteNotifyChannel 删除指定通知频道。
  async deleteNotifyChannel(
    auth: AlertDogRequestAuth,
    id: number,
  ): Promise<unknown> {
    return this.requestFromMctBackend<unknown>(
      "POST",
      "/notify/channel/delete",
      auth,
      { id },
    );
  }

  // setDefaultNotifyChannel 把指定通知频道设为默认通知渠道。
  async setDefaultNotifyChannel(
    auth: AlertDogRequestAuth,
    id: number,
  ): Promise<unknown> {
    return this.requestFromMctBackend<unknown>(
      "POST",
      "/notify/channel/set_default",
      auth,
      { id },
    );
  }

  // sendNotifyChannelTest 向指定通知频道发送测试消息。
  async sendNotifyChannelTest(
    auth: AlertDogRequestAuth,
    id: number,
  ): Promise<unknown> {
    return this.performRequest<unknown>(
      "POST",
      `${this.buildMctWsBaseUrl()}/channel/send_test_by_id`,
      auth,
      { id },
    );
  }

  // listCexCandleSignalFeeds 获取当前量价异动信号 feed 列表。
  async listCexCandleSignalFeeds(
    auth: AlertDogRequestAuth,
    params: {
      next: number;
      limit: number;
      desc: boolean;
    },
  ): Promise<AlertDogCexCandleSignalFeedListResult> {
    const searchParams = new URLSearchParams({
      next: String(params.next),
      limit: String(params.limit),
      desc: String(params.desc),
    });
    const payload = await this.performRequestPayload<
      AlertDogPageResponse<AlertDogCexCandleSignalFeedRecord[]> | AlertDogFailureResponse
    >(
      "GET",
      `${this.buildUrl("/monitor/cex/candleSignal/feeds")}?${searchParams.toString()}`,
      auth,
    );

    if (!isSuccessPageResponse(payload)) {
      throw new AlertDogClientError(
        "api",
        payload.message ?? payload.result ?? "AlertDog business request failed",
        { apiCode: payload.code },
      );
    }

    return {
      page: payload.page,
      signals: payload.data,
    };
  }

  // createCexCandleSignalSubscription 创建量价异动订阅。
  async createCexCandleSignalSubscription(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexCandleSignalSubscriptionCreatePayload,
  ): Promise<unknown> {
    return this.performRequest<unknown>(
      "POST",
      this.buildUrl("/monitor/cex/candleSignal/subscribe/create"),
      auth,
      payload,
    );
  }

  // updateCexCandleSignalSubscription 更新量价异动订阅。
  async updateCexCandleSignalSubscription(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexCandleSignalSubscriptionUpdatePayload,
  ): Promise<unknown> {
    return this.performRequest<unknown>(
      "POST",
      this.buildUrl("/monitor/cex/candleSignal/subscribe/update"),
      auth,
      payload,
    );
  }

  // listCexCandleSignalSubscriptions 获取量价异动订阅列表。
  async listCexCandleSignalSubscriptions(
    auth: AlertDogRequestAuth,
    params: {
      index: number;
      limit: number;
      desc: boolean;
    },
  ): Promise<AlertDogCexCandleSignalSubscriptionListResult> {
    const searchParams = new URLSearchParams({
      index: String(params.index),
      limit: String(params.limit),
      desc: String(params.desc),
    });
    const payload = await this.performRequestPayload<
      | AlertDogPageResponse<unknown[]>
      | AlertDogSuccessResponse<unknown[]>
      | AlertDogFailureResponse
    >(
      "GET",
      `${this.buildUrl("/monitor/cex/candleSignal/subscribe/find/all")}?${searchParams.toString()}`,
      auth,
    );

    if (!isSuccessResponse(payload)) {
      throw new AlertDogClientError(
        "api",
        payload.message ?? payload.result ?? "AlertDog business request failed",
        { apiCode: payload.code },
      );
    }

    return {
      page: "page" in payload ? payload.page : null,
      subscriptions: payload.data,
    };
  }

  // listCexCandleSignalHistory 获取用户订阅的量价异动通知历史记录。
  async listCexCandleSignalHistory(
    auth: AlertDogRequestAuth,
    params: {
      subscribeId?: number;
      cursor: number;
      limit: number;
      desc: boolean;
      pageFlip?: "prev" | "next";
    },
  ): Promise<AlertDogCexCandleSignalHistoryListResult> {
    const searchParams = new URLSearchParams();
    if (params.subscribeId !== undefined) {
      searchParams.set("subscribe_id", String(params.subscribeId));
    }
    searchParams.set("cursor", String(params.cursor));
    searchParams.set("limit", String(params.limit));
    searchParams.set("desc", String(params.desc));
    if (params.pageFlip !== undefined) {
      searchParams.set("pageFlip", params.pageFlip);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#config.timeoutMs);

    let payload: AlertDogCexCandleSignalHistoryResponse | AlertDogFailureResponse;
    try {
      const requestUrl = `${this.buildUrl("/monitor/cex/candleSignal/history")}?${searchParams.toString()}`;
      this.logHttpRequest("GET", requestUrl, auth);
      const response = await fetch(
        requestUrl,
        {
          method: "GET",
          headers: this.buildHeaders(auth),
          signal: controller.signal,
        },
      );

      const rawResponseText = await response.text();
      this.logHttpResponse("GET", requestUrl, response.status, rawResponseText);

      if (!response.ok) {
        throw this.buildHttpResponseError(response.status, requestUrl, rawResponseText);
      }

      payload = this.parseJsonResponse<
        AlertDogCexCandleSignalHistoryResponse | AlertDogFailureResponse
      >(rawResponseText, requestUrl);
    } catch (error) {
      if (error instanceof AlertDogClientError) {
        throw error;
      }

      throw new AlertDogClientError("network", "AlertDog 网络请求失败", {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!isSuccessCexCandleSignalHistoryResponse(payload)) {
      throw new AlertDogClientError(
        "api",
        payload.message ?? payload.result ?? "AlertDog business request failed",
        { apiCode: payload.code },
      );
    }

    return {
      page: payload.page,
      history: payload.result,
    };
  }

  // setCexCandleSignalSubscriptionsDisabled 批量启用或禁用量价异动订阅。
  async setCexCandleSignalSubscriptionsDisabled(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexCandleSignalSubscriptionSetDisabledPayload,
  ): Promise<any> {
    return this.performRequest<any>(
      "POST",
      this.buildUrl("/monitor/cex/candleSignal/subscribe/disable"),
      auth,
      payload,
    );
  }

  // deleteCexCandleSignalSubscriptions 批量删除量价异动订阅。
  async deleteCexCandleSignalSubscriptions(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexCandleSignalSubscriptionDeletePayload,
  ): Promise<any> {
    return this.performRequest<any>(
      "POST",
      this.buildUrl("/monitor/cex/candleSignal/subscribe/delete"),
      auth,
      payload,
    );
  }

  // searchCexAssets 按关键字搜索 CEX 资产。
  async searchCexAssets(    auth: AlertDogRequestAuth, keyword: string): Promise<AlertDogCexAssetRecord[]> {
    return this.performRequest<AlertDogCexAssetRecord[]>(
        "GET",
        this.buildUrl(      `/cex/searchAsset?keyword=${keyword.toString()}`),
        auth
    );

  }

  // listCexFutureSettleTimeDiffArbitrage 获取合约结算时间差套利列表。
  async listCexFutureSettleTimeDiffArbitrage(
    auth: AlertDogRequestAuth,
    params: {
      index: number;
      limit: number;
      quote: string;
      assetId?: number;
    },
  ): Promise<AlertDogCexFutureSettleTimeDiffArbitrageListResult> {
    const searchParams = new URLSearchParams({
      index: String(params.index),
      page: String(params.index),
      limit: String(params.limit),
      quote: params.quote,
    });

    if (params.assetId !== undefined) {
      searchParams.set("assetId", String(params.assetId));
    }

    const payload = await this.performRequestPayload<
      AlertDogPageResponse<AlertDogCexFutureSettleTimeDiffArbitrageRecord[]> | AlertDogFailureResponse
    >(
      "GET",
      `${this.buildUrl("/cex/future/settleTimeDiff-arbitrage")}?${searchParams.toString()}`,
      auth,
    );

    if (!isSuccessPageResponse(payload)) {
      throw new AlertDogClientError(
        "api",
        payload.message ?? payload.result ?? "AlertDog business request failed",
        { apiCode: payload.code },
      );
    }

    return {
      page: payload.page,
      records: payload.data,
    };
  }

  // createCexPriceSubscription 创建价格监控订阅。
  async createCexPriceSubscription(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexPriceSubscriptionCreatePayload,
  ): Promise<unknown> {
    return this.performRequest<unknown>(
      "POST",
      this.buildUrl("/monitor/cex/price/subscribe/create"),
      auth,
      payload,
    );
  }

  // listCexPriceSubscriptions 获取价格监控订阅列表。
  async listCexPriceSubscriptions(
    auth: AlertDogRequestAuth,
    params: {
      index: number;
      limit: number;
      desc: boolean;
    },
  ): Promise<AlertDogCexPriceSubscriptionListResult> {
    const searchParams = new URLSearchParams({
      index: String(params.index),
      limit: String(params.limit),
      desc: String(params.desc),
    });
    const payload = await this.performRequestPayload<
      | AlertDogPageResponse<unknown[]>
      | AlertDogSuccessResponse<unknown[]>
      | AlertDogFailureResponse
    >(
      "GET",
      `${this.buildUrl("/monitor/cex/price/subscribe/find/all")}?${searchParams.toString()}`,
      auth,
    );

    if (!isSuccessResponse(payload)) {
      throw new AlertDogClientError(
        "api",
        payload.message ?? payload.result ?? "AlertDog business request failed",
        { apiCode: payload.code },
      );
    }

    return {
      page: "page" in payload ? payload.page : null,
      subscriptions: payload.data,
    };
  }

  // setCexPriceSubscriptionsDisabled 批量启用或禁用价格监控订阅。
  async setCexPriceSubscriptionsDisabled(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexPriceSubscriptionSetDisabledPayload,
  ): Promise<unknown> {
    return this.performRequest<unknown>(
      "POST",
      this.buildUrl("/monitor/cex/price/subscribe/disable"),
      auth,
      payload,
    );
  }

  // deleteCexPriceSubscriptions 批量删除价格监控订阅。
  async deleteCexPriceSubscriptions(
    auth: AlertDogRequestAuth,
    payload: AlertDogCexPriceSubscriptionDeletePayload,
  ): Promise<unknown> {
    return this.performRequest<unknown>(
      "POST",
      this.buildUrl("/monitor/cex/price/subscribe/delete"),
      auth,
      payload,
    );
  }

  // request 向 AlertDog 发起请求并提取成功数据。
  private async request<T>(
    method: "GET" | "POST",
    path: string,
    auth: AlertDogRequestAuth,
  ): Promise<T> {
    return this.performRequest<T>(method, this.buildUrl(path), auth);
  }

  // requestFromMctBackend 向 mct backend 发起请求并提取成功数据。
  private async requestFromMctBackend<T>(
    method: "GET" | "POST",
    path: string,
    auth: AlertDogRequestAuth,
    body?: object,
  ): Promise<T> {
    return this.performRequest<T>(method, this.buildMctBackendUrl(path), auth, body);
  }

  // performRequest 执行 HTTP 请求并统一处理成功与失败响应。
  private async performRequest<T>(
    method: "GET" | "POST",
    url: string,
    auth: AlertDogRequestAuth,
    body?: object,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#config.timeoutMs);

    try {
      this.logHttpRequest(method, url, auth);
      const response = await fetch(url, {
        method,
        headers: this.buildHeaders(auth, body),
        body: this.buildBody(method, body),
        signal: controller.signal,
      });

      const rawResponseText = await response.text();
      this.logHttpResponse(method, url, response.status, rawResponseText);

      if (!response.ok) {
        throw this.buildHttpResponseError(response.status, url, rawResponseText);
      }

      const payload = this.parseJsonResponse<
        | AlertDogSuccessResponse<T>
        | AlertDogFailureResponse
      >(rawResponseText, url);

      return extractAlertDogResponseData(payload);
    } catch (error) {
      if (error instanceof AlertDogClientError) {
        throw error;
      }

      throw new AlertDogClientError("network", "AlertDog 网络请求失败", {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  // performRequestPayload 执行 HTTP 请求并返回原始业务 payload，供特殊结构接口复用。
  private async performRequestPayload<
    T extends AlertDogSuccessResponse<unknown> | AlertDogFailureResponse,
  >(
    method: "GET" | "POST",
    url: string,
    auth: AlertDogRequestAuth,
    body?: object,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#config.timeoutMs);

    try {
      this.logHttpRequest(method, url, auth);
      const response = await fetch(url, {
        method,
        headers: this.buildHeaders(auth, body),
        body: this.buildBody(method, body),
        signal: controller.signal,
      });

      const rawResponseText = await response.text();
      this.logHttpResponse(method, url, response.status, rawResponseText);

      if (!response.ok) {
        throw this.buildHttpResponseError(response.status, url, rawResponseText);
      }

      return this.parseJsonResponse<T>(rawResponseText, url);
    } catch (error) {
      if (error instanceof AlertDogClientError) {
        throw error;
      }

      throw new AlertDogClientError("network", "AlertDog 网络请求失败", {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  // buildUrl 拼接完整的 AlertDog 请求地址。
  private buildUrl(path: string): string {
    return `${this.#config.alertDogBaseUrl}${path}`;
  }

  // buildMctBackendUrl 拼接 mct backend 请求地址。
  private buildMctBackendUrl(path: string): string {
    return `${this.#config.mctBackendBaseUrl}${path}`;
  }

  // buildMctWsBaseUrl 把 mct backend 根地址转换为 ws api 所需的根地址。
  private buildMctWsBaseUrl(): string {
    return this.#config.mctBackendBaseUrl.replace(/\/api$/, "/ws/api");
  }

  // buildHeaders 构建调用 AlertDog API 所需的请求头。
  private buildHeaders(
    auth: AlertDogRequestAuth,
    body?: object,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...buildVersionHeaders(getAgentClientVersionInfo()),
    };

    if (auth.apiKey) {
      headers["X-Api-Key"] = auth.apiKey;
    }

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  // buildBody 根据请求方法与 body 生成 fetch 需要的请求体。
  private buildBody(
    method: "GET" | "POST",
    body?: object,
  ): string | undefined {
    if (method !== "POST" || !body) {
      return undefined;
    }

    return JSON.stringify(body);
  }

  // logHttpRequest 在开启调试时打印实际发出的 HTTP 方法、URL 与当前使用的 apikey。
  private logHttpRequest(
    method: "GET" | "POST",
    url: string,
    auth: AlertDogRequestAuth,
  ): void {
    if (!this.#config.debugHttp) {
      return;
    }

    process.stderr.write(`[AlertDog HTTP] ${method} ${url}\n`);
    process.stderr.write(`[AlertDog HTTP] apiKey: ${this.formatDebugApiKey(auth)}\n`);
  }

  // formatDebugApiKey 返回调试日志中用于展示的当前 apikey。
  private formatDebugApiKey(auth: AlertDogRequestAuth): string {
    if (!auth.apiKey) {
      return "(empty)";
    }

    return auth.apiKey;
  }

  // logHttpResponse 在开启调试时打印原始响应状态码与响应体，便于排查权限和路径问题。
  private logHttpResponse(
    method: "GET" | "POST",
    url: string,
    status: number,
    rawResponseText: string,
  ): void {
    if (!this.#config.debugHttp) {
      return;
    }

    process.stderr.write(`[AlertDog HTTP] ${method} ${url} -> ${status}\n`);
    process.stderr.write(`[AlertDog HTTP] response: ${rawResponseText}\n`);
  }

  // tryParseFailureResponse 尝试把失败响应体解析成统一错误结构，优先读取 response body 的 message/result。
  private tryParseFailureResponse(rawResponseText: string): AlertDogFailureResponse | null {
    if (!rawResponseText.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawResponseText) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
      }

      return parsed as AlertDogFailureResponse;
    } catch {
      return null;
    }
  }

  // buildHttpResponseError 基于 HTTP 失败响应体构造错误，优先透传服务端返回的业务文案。
  private buildHttpResponseError(
    status: number,
    url: string,
    rawResponseText: string,
  ): AlertDogClientError {
    const failurePayload = this.tryParseFailureResponse(rawResponseText);
    const responseMessage = failurePayload?.message ?? failurePayload?.result;
    const message =
      responseMessage && String(responseMessage).trim() !== ""
        ? String(responseMessage).trim()
        : `AlertDog HTTP 请求失败，状态码 ${status}，URL: ${url}`;

    if (typeof failurePayload?.code === "number") {
      return new AlertDogClientError("api", message, {
        status,
        apiCode: failurePayload.code,
      });
    }

    return new AlertDogClientError("http", message, {
      status,
      apiCode: failurePayload?.code,
    });
  }

  // parseJsonResponse 解析 JSON 响应，失败时抛出带原始返回信息的业务错误。
  private parseJsonResponse<T>(rawResponseText: string, url: string): T {
    try {
      return JSON.parse(rawResponseText) as T;
    } catch {
      throw new AlertDogClientError(
        "api",
        `AlertDog 返回了非 JSON 响应，URL: ${url}，Raw: ${rawResponseText}`,
      );
    }
  }
}
