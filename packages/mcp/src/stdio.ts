import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v4";

import {
  readSavedApiKeyOnly,
} from "@alertdog/cli";
import {
  createDefaultAlertDogToolRuntime,
  printRuntimeVersion,
  STDIO_VERSION,
  TOOL_REGISTRATIONS,
  type AlertDogToolRegistration,
  type ToolInputJsonSchema,
} from "@alertdog/core";
import {
  buildOptionalApiKeyJsonSchema,
  jsonSchemaToZod,
} from "./json-schema.js";

interface MinimalStdioServer {
  tool(
    name: string,
    description: string,
    handler: () => Promise<Record<string, unknown>>,
  ): void;
  tool(
    name: string,
    description: string,
    schema: z.ZodTypeAny,
    handler: (args: Record<string, string | number>) => Promise<Record<string, unknown>>,
  ): void;
}

interface DirectToolCaller {
  run(
    name: string,
    args?: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
}

// registerProxyTools 把本地 core tools 注册到 stdio 入口，供外部 MCP 客户端调用。
export function registerProxyTools(
  toolServer: MinimalStdioServer,
  directRuntime: DirectToolCaller,
): void {
  for (const toolRegistration of TOOL_REGISTRATIONS) {
    registerProxyTool(toolServer, directRuntime, toolRegistration);
  }
}

// registerProxyTool 根据统一工具规格注册单个 stdio 本地执行工具。
function registerProxyTool(
  toolServer: MinimalStdioServer,
  directRuntime: DirectToolCaller,
  toolRegistration: AlertDogToolRegistration<unknown>,
): void {
  const proxyInputSchema = getProxyInputSchema(toolRegistration);

  if (isEmptyObjectSchema(toolRegistration.inputSchema)) {
    toolServer.tool(toolRegistration.name, toolRegistration.description, async () =>
      directRuntime.run(toolRegistration.name),
    );
    return;
  }

  toolServer.tool(
    toolRegistration.name,
    toolRegistration.description,
    proxyInputSchema,
    async (args) =>
      directRuntime.run(toolRegistration.name, injectConfiguredApiKey(args)),
  );
}

// getProxyInputSchema 根据工具规格生成 stdio 代理实际对外暴露的输入 schema。
function getProxyInputSchema(
  toolRegistration: Pick<AlertDogToolRegistration<unknown>, "requiresApiKey" | "inputSchema">,
): z.ZodTypeAny {
  const inputSchema = toolRegistration.requiresApiKey
    ? buildOptionalApiKeyJsonSchema(toolRegistration.inputSchema)
    : toolRegistration.inputSchema;

  return jsonSchemaToZod(inputSchema as ToolInputJsonSchema);
}

// isEmptyObjectSchema 判断当前工具是否没有声明输入参数。
function isEmptyObjectSchema(schema: ToolInputJsonSchema): boolean {
  return Object.keys(schema).length === 0;
}

// injectConfiguredApiKey 把显式参数或本地配置文件里的 apikey 注入到请求参数，stdio 禁止读取 env。
function injectConfiguredApiKey(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const explicitApiKey = typeof args.apiKey === "string" ? args.apiKey : undefined;
  const resolvedApiKey = explicitApiKey?.trim() || readSavedApiKeyOnly();

  if (!resolvedApiKey) {
    return args;
  }

  return {
    ...args,
    apiKey: resolvedApiKey,
  };
}

// createProxyServer 创建本地 stdio MCP server，并直接执行本地 core tools。
function createProxyServer(directRuntime: DirectToolCaller): McpServer {
  const server = new McpServer({
    name: "contract-listener-alertdog-stdio-proxy",
    version: STDIO_VERSION,
  });
  const toolServer = server as unknown as MinimalStdioServer;

  registerProxyTools(toolServer, directRuntime);
  return server;
}

// main 启动本地 stdio 脚本，供只支持 command+args 的客户端直接调用 AlertDog API。
export async function main(): Promise<void> {
  printRuntimeVersion("stdio", STDIO_VERSION);
  const alertDogRuntime = createDefaultAlertDogToolRuntime();
  const server = createProxyServer(alertDogRuntime);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
