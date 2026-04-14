export { getToolCategoryDefinition, TOOL_CATEGORY_DEFINITIONS } from "./tool-categories.js";
import type { AlertDogToolRegistration, AlertDogToolSpec } from "./tool-types.js";
import { APIKEY_TOOL_REGISTRATIONS } from "./tool-registry/apikey-tool.js";
import { CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS } from "./tool-registry/cex-monitor-tool.js";
import { CEX_PRICE_TOOL_REGISTRATIONS } from "./tool-registry/cex-monitor-tool.js";
import { NOTIFY_CHANNEL_TOOL_REGISTRATIONS } from "./tool-registry/notify-channel-tool.js";

export const TOOL_REGISTRATIONS: AlertDogToolRegistration<any>[] = [
  ...APIKEY_TOOL_REGISTRATIONS,
  ...NOTIFY_CHANNEL_TOOL_REGISTRATIONS,
  ...CEX_PRICE_TOOL_REGISTRATIONS,
  ...CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS,
];

export const TOOL_SPECS: AlertDogToolSpec[] = TOOL_REGISTRATIONS;

export const TOOL_NAMES = TOOL_SPECS.map((toolSpec) => toolSpec.name);

export const TOOL_SPECS_BY_NAME = new Map(
  TOOL_SPECS.map((toolSpec) => [toolSpec.name, toolSpec] as const),
);

// getToolSpec 返回工具共享规格，供 server、client、verify 和 skills 复用同一份定义。
export function getToolSpec(name: string): AlertDogToolSpec {
  const toolSpec = TOOL_SPECS_BY_NAME.get(name);
  if (!toolSpec) {
    throw new Error(`Unknown tool spec: ${name}`);
  }
  return toolSpec;
}
