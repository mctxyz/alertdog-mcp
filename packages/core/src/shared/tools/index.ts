import { AlertDogClient } from "../../api/alertdog.js";
import { loadCoreConfig } from "../../config.js";
import {
  TOOL_SPECS,
  TOOL_SPECS_BY_NAME,
} from "../tool-registry.js";
import { APIKEY_TOOL_REGISTRATIONS } from "../tool-registry/apikey-tool.js";
import { CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS } from "../tool-registry/cex-monitor-tool.js";
import { CEX_PRICE_TOOL_REGISTRATIONS } from "../tool-registry/cex-monitor-tool.js";
import {
  createExecutorsFromRegistrations,
  type ToolExecutorMap,
  type ToolPayload,
} from "./common.js";
import { NOTIFY_CHANNEL_TOOL_REGISTRATIONS } from "../tool-registry/notify-channel-tool.js";

// createToolExecutorMap 汇总不同类别的工具执行器，供 stdio 和 cli 直接复用。
export function createToolExecutorMap(client: AlertDogClient): ToolExecutorMap {
  return {
    ...createExecutorsFromRegistrations(client, APIKEY_TOOL_REGISTRATIONS),
    ...createExecutorsFromRegistrations(client, NOTIFY_CHANNEL_TOOL_REGISTRATIONS),
    ...createExecutorsFromRegistrations(client, CEX_PRICE_TOOL_REGISTRATIONS),
    ...createExecutorsFromRegistrations(client, CEX_CANDLE_SIGNAL_TOOL_REGISTRATIONS),
  };
}

export interface ListedTool {
  name: string;
  description: string;
}

// AlertDogToolRuntime 负责在本地直接调度各类 core tools
export class AlertDogToolRuntime {
  readonly #executors: ToolExecutorMap;

  // constructor 注入已经装配好的工具执行器映射。
  constructor(executors: ToolExecutorMap) {
    this.#executors = executors;
  }

  // listTools 返回当前本地可用的工具清单。
  listTools(): { tools: ListedTool[] } {
    return {
      tools: TOOL_SPECS.map((toolSpec) => ({
        name: toolSpec.name,
        description: toolSpec.description,
      })),
    };
  }

  // callTool 直接执行指定工具，并返回规范化后的 JSON 结果。
  async run(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<ToolPayload> {
    const executor = this.#executors[name];
    if (!executor) {
      const toolSpec = TOOL_SPECS_BY_NAME.get(name);
      const message = toolSpec
        ? `Tool ${name} is registered but missing an executor`
        : `Unknown tool: ${name}`;
      throw new Error(message);
    }

    return executor(args);
  }
}

// createDefaultAlertDogToolRuntime 使用默认配置创建一个本地直连工具运行时。
export function createDefaultAlertDogToolRuntime(): AlertDogToolRuntime {
  const client = new AlertDogClient(loadCoreConfig());
  return new AlertDogToolRuntime(createToolExecutorMap(client));
}
