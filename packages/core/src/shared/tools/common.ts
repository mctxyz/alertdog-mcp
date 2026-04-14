type MCPToolResponse = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

import type {
  AlertDogToolRegistration,
  ToolExecutor,
  ToolExecutorMap,
  ToolPayload,
} from "../tool-types.js";
import type { z } from "zod/v4";

export type {
  AlertDogToolRegistration,
  ToolExecutor,
  ToolExecutorMap,
  ToolPayload,
} from "../tool-types.js";

interface MinimalCollectorServer {
  tool(
    name: string,
    description: string,
    handler: () => Promise<MCPToolResponse>,
  ): void;
  tool(
    name: string,
    description: string,
    schema: Record<string, z.ZodTypeAny>,
    handler: (args: Record<string, unknown>) => Promise<MCPToolResponse>,
  ): void;
}

// toToolPayload 把原 server tool 的 JSON text 返回解包成直接可复用的对象结果。
function toToolPayload(result: MCPToolResponse): ToolPayload {
  const firstText = result.content[0]?.text;
  if (!firstText) {
    return {};
  }

  try {
    const parsed = JSON.parse(firstText) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ToolPayload;
    }
  } catch {
    return {
      ok: !result.isError,
      raw: firstText,
    };
  }

  return {
    ok: !result.isError,
    raw: firstText,
  };
}

// createExecutorCollector 创建一个最小 server 适配器，把 MCP 注册函数转换成直接可调用的执行器。
export function createExecutorCollector(): {
  server: MinimalCollectorServer;
  executors: ToolExecutorMap;
} {
  const executors: ToolExecutorMap = {};

  const server: MinimalCollectorServer = {
    tool: (...args: unknown[]) => {
      const [name, , maybeSchemaOrHandler, maybeHandler] = args;
      const handler =
        typeof maybeHandler === "function"
          ? maybeHandler
          : typeof maybeSchemaOrHandler === "function"
            ? maybeSchemaOrHandler
            : undefined;

      if (typeof handler !== "function") {
        throw new Error(`Tool ${String(name)} is missing a handler`);
      }

      executors[String(name)] = async (
        toolArgs: Record<string, unknown> = {},
      ): Promise<ToolPayload> => {
        const response = await handler(toolArgs);
        return toToolPayload(response as MCPToolResponse);
      };
    },
  };

  return {
    server,
    executors,
  };
}

// createExecutorsFromRegistrations 根据工具注册定义批量生成执行器映射。
export function createExecutorsFromRegistrations<TClient>(
  client: TClient,
  registrations: AlertDogToolRegistration<TClient>[],
): ToolExecutorMap {
  return Object.fromEntries(
    registrations.map((registration) => [
      registration.name,
      async (args: Record<string, unknown> = {}) => registration.handler(client, args),
    ]),
  );
}
