import { outputLine } from "../formatter.js";
import {
  formatInlinePairs,
  formatInlineRecord,
  formatScalarValue,
  isRecord,
} from "./render-helpers.js";

// renderCexMonitorToolResult 为 cex-monitor 相关复杂列表提供统一的单行渲染。
export function renderCexMonitorToolResult(
  toolName: string,
  result: Record<string, unknown>,
): boolean {
  if (toolName === "cex_offical_candle_signal_feed_list") {
    renderSingleLineListResult(result, "signals", formatCexCandleSignalFeedLine);
    return true;
  }

  if (toolName === "cex_candle_signal_subscription_list") {
    renderSingleLineListResult(
      result,
      "subscriptions",
      formatCexCandleSignalSubscriptionLine,
    );
    return true;
  }

  if (toolName === "cex_candle_signal_subscription_notify_history_list") {
    renderSingleLineListResult(result, "history", formatCexCandleSignalHistoryLine);
    return true;
  }

  return false;
}

// renderSingleLineListResult 用统一骨架渲染列表结果，列表项压成单行。
function renderSingleLineListResult(
  result: Record<string, unknown>,
  listKey: string,
  formatLine: (item: Record<string, unknown>) => string,
): void {
  outputLine(
    formatInlinePairs([
      ["ok", result.ok],
      ["count", result.count],
    ]),
  );

  if (isRecord(result.page)) {
    outputLine("");
    outputLine(`page: ${formatInlineRecord(result.page)}`);
  }

  if (isRecord(result.error)) {
    outputLine("");
    outputLine(`error: ${formatInlineRecord(result.error)}`);
  }

  const items = Array.isArray(result[listKey])
    ? result[listKey].filter(isRecord)
    : [];

  outputLine("");
  outputLine(`${listKey}:`);

  if (items.length === 0) {
    outputLine("  (empty)");
    return;
  }

  for (const [index, item] of items.entries()) {
    outputLine(`  [${index + 1}] ${formatLine(item)}`);
  }
}

// formatCexCandleSignalFeedLine 把单条量价异动 feed 压缩成单行摘要。
function formatCexCandleSignalFeedLine(signal: Record<string, unknown>): string {
  return formatInlinePairs([
    ["id", signal.id],
    ["symbol", signal.baseSymbol ?? signal.base_symbol],
    ["exchange", signal.exchange],
    ["interval", signal.interval],
    ["price", signal.price],
    ["changePct", signal.changePct ?? signal.change_pct],
    ["quoteVolume", signal.quoteVolume ?? signal.quote_volume],
    ["volumeMultiple", signal.volumeMultiple ?? signal.volume_multiple],
    ["candleStartAt", signal.candleStartAt ?? signal.candle_start_at],
    ["candleEndAt", signal.candleEndAt ?? signal.candle_end_at],
  ]);
}

// formatCexCandleSignalSubscriptionLine 把单条量价异动订阅压缩成单行摘要。
function formatCexCandleSignalSubscriptionLine(
  subscription: Record<string, unknown>,
): string {
  return formatInlinePairs([
    ["id", subscription.id],
    ["interval", subscription.interval],
    ["direction", subscription.direction],
    ["minQuoteVolume", subscription.minQuoteVolume],
    ["minVolumeMultiple", subscription.minVolumeMultiple],
    ["minAbsChangePct", subscription.minAbsChangePct],
    ["notifyInterval", subscription.notifyInterval],
    ["lastNotify", subscription.lastNotify],
    ["nextNotifyAt", subscription.nextNotifyAt],
    ["notifyHistoryRetention", subscription.notifyHistoryRetention],
    ["once", subscription.once],
    ["disabled", subscription.disabled],
    ["exchanges", formatExchangeSummaryList(subscription.exchanges)],
    ["channels", formatChannelSummaryList(subscription.channels)],
  ]);
}

// formatCexCandleSignalHistoryLine 把单条用户订阅历史压缩成单行摘要。
function formatCexCandleSignalHistoryLine(history: Record<string, unknown>): string {
  return formatInlinePairs([
    ["id", history.id],
    ["subscribeId", history.subscribeId],
    ["symbol", history.baseSymbol],
    ["exchange", history.exchange],
    ["interval", history.interval],
    ["price", history.price],
    ["changePct", history.changePct],
    ["avgQuoteVolume", history.avgQuoteVolume],
    ["quoteVolume", history.quoteVolume],
    ["volumeMultiple", history.volumeMultiple],
    ["candleStartAt", history.candleStartAt],
    ["candleEndAt", history.candleEndAt],
    ["createdAt", history.createdAt],
  ]);
}

// formatExchangeSummaryList 把交易所列表压缩成逗号分隔的摘要字符串。
function formatExchangeSummaryList(value: unknown): string {
  const exchanges = Array.isArray(value) ? value.filter(isRecord) : [];
  if (exchanges.length === 0) {
    return "(empty)";
  }

  return exchanges
    .map(
      (exchange) =>
        `${formatScalarValue(exchange.exchange)}(id=${formatScalarValue(exchange.id)})`,
    )
    .join(", ");
}

// formatChannelSummaryList 把通知渠道列表压缩成逗号分隔的摘要字符串。
function formatChannelSummaryList(value: unknown): string {
  const channels = Array.isArray(value) ? value.filter(isRecord) : [];
  if (channels.length === 0) {
    return "(empty)";
  }

  return channels
    .map((channel) =>
      formatInlinePairs([
        ["id", channel.id],
        ["type", channel.channelId],
        ["name", channel.name],
        ["chatId", channel.chatId],
        ["disabled", channel.disabled],
      ]),
    )
    .join(", ");
}
