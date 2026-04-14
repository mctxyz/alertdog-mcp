#!/usr/bin/env node

import "dotenv/config";

import { homedir } from "node:os";

import {
  clearSavedApiKey,
  getLocalConfigPath,
  maskApiKey,
  readLocalConfig,
  readResolvedApiKey,
  setSavedApiKey,
} from "./local-config.js";
import {
  CLI_VERSION,
  createDefaultAlertDogToolRuntime,
  getToolSpec,
  loadCoreConfig,
  printRuntimeVersion,
} from "@alertdog/core";
import {
  renderAuthResult,
  renderToolHelp,
  renderListToolsResult,
  renderToolResult,
} from "./render-tool-result.js";

export * from "./local-config.js";

type ParsedArgs =
  | { command: "help"; topic?: string; toolName?: string; json: boolean }
  | { command: "list-tools"; json: boolean; help?: boolean }
  | { command: "run"; toolName: string; toolArgs: Record<string, unknown>; json: boolean; help?: boolean }
  | { command: "auth"; action: "set"; apiKey: string; json: boolean; help?: boolean }
  | { command: "auth"; action: "show" | "clear"; json: boolean; help?: boolean };

// parseArgs 解析命令行参数，支持 list-tools、run/call 与 auth 三类子命令。
export function parseArgs(
  argv: string[],
  env: NodeJS.ProcessEnv = process.env,
  homeDir: string = homedir(),
): ParsedArgs {
  const [command, subcommandOrToolName, ...rawRunArgs] = argv;

  if (!command || command === "--help" || command === "-h" || command === "help") {
    return {
      command: "help",
      json: false,
      ...(subcommandOrToolName ? { topic: subcommandOrToolName } : {}),
    };
  }

  if (command === "list-tools") {
    const { json, help } = extractCliOptions(rawRunArgs);
    return { command, json, ...(help ? { help: true } : {}) };
  }

  if (command === "auth") {
    const { apiKey, json, help } = extractCliOptions(rawRunArgs);
    if (help || subcommandOrToolName === "--help" || subcommandOrToolName === "-h") {
      return { command: "help", topic: "auth", json };
    }
    return parseAuthArgs(subcommandOrToolName, apiKey, json, env, homeDir);
  }

  if (command !== "call" && command !== "run") {
    const parsedToolArgs = parseToolArgs([
      ...(subcommandOrToolName ? [subcommandOrToolName] : []),
      ...rawRunArgs,
    ]);

    return {
      command: "run",
      toolName: command,
      json: parsedToolArgs.json,
      ...(parsedToolArgs.help ? { help: true } : {}),
      toolArgs: mergeApiKeyIntoArgs(
        parsedToolArgs.toolArgs,
        readResolvedApiKey(parsedToolArgs.apiKey, env, homeDir),
      ),
    };
  }

  if (!subcommandOrToolName) {
    throw new Error(
      "Usage: node index.js list-tools | node index.js run <tool-name> [json-args] | node index.js <tool-name> [json-args] | node index.js auth <set|show|clear> [--apikey=<value>]",
    );
  }

  const parsedToolArgs = parseToolArgs(rawRunArgs);

  return {
    command: "run",
    toolName: subcommandOrToolName,
    json: parsedToolArgs.json,
    ...(parsedToolArgs.help ? { help: true } : {}),
    toolArgs: mergeApiKeyIntoArgs(
      parsedToolArgs.toolArgs,
      readResolvedApiKey(parsedToolArgs.apiKey, env, homeDir),
    ),
  };
}

// extractCliOptions 提取位置参数与 --apikey 选项，避免要求用户把敏感值写进 JSON。
function extractCliOptions(argv: string[]): {
  positionals: string[];
  apiKey?: string;
  json: boolean;
  help: boolean;
} {
  const positionals: string[] = [];
  let apiKey: string | undefined;
  let json = false;
  let help = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg.startsWith("--apikey=")) {
      apiKey = arg.slice("--apikey=".length).trim() || undefined;
      continue;
    }

    if (arg === "--apikey") {
      throw new Error("Usage error: use --apikey=<value> instead of separating the value");
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    positionals.push(arg);
  }

  return { positionals, apiKey, json, help };
}

interface ParsedToolArgs {
  toolArgs: Record<string, unknown>;
  apiKey?: string;
  json: boolean;
  help: boolean;
}

// parseAuthArgs 解析 auth 子命令参数，并统一读取待保存的 apikey。
function parseAuthArgs(
  subcommand: string | undefined,
  apiKey: string | undefined,
  json: boolean,
  env: NodeJS.ProcessEnv,
  homeDir: string,
): ParsedArgs {
  if (subcommand === "show" || subcommand === "clear") {
    return {
      command: "auth",
      action: subcommand,
      json,
    };
  }

  if (subcommand === "set") {
    const resolvedApiKey = readResolvedApiKey(apiKey, env, homeDir);
    if (!resolvedApiKey) {
      throw new Error("apiKey is required for auth set");
    }

    return {
      command: "auth",
      action: "set",
      apiKey: resolvedApiKey,
      json,
    };
  }

  throw new Error(
    "Usage: node index.js auth <set|show|clear> [--apikey=<value>]",
  );
}

export interface ToolCommandContext {
  toolName: string;
  toolArgs: Record<string, unknown>;
}

// parseJsonArgs 解析 tool 的 JSON 入参；未传时返回空对象。
function parseJsonArgs(rawArgs?: string): Record<string, unknown> {
  if (!rawArgs) {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawArgs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON arguments: ${message}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON arguments must be an object");
  }

  return parsed as Record<string, unknown>;
}

// parseToolArgs 解析 run/call 的工具参数，兼容 JSON 字符串和 --key value 两种输入模式。
function parseToolArgs(argv: string[]): ParsedToolArgs {
  if (argv.length === 0) {
    return {
      toolArgs: {},
      json: false,
      help: false,
    };
  }

  if (argv.length === 1 && (argv[0] === "--help" || argv[0] === "-h")) {
    return {
      toolArgs: {},
      json: false,
      help: true,
    };
  }

  if (argv.length === 1 && !argv[0]?.startsWith("--")) {
    return {
      toolArgs: parseJsonArgs(argv[0]),
      json: false,
      help: false,
    };
  }

  return parseFlagToolArgs(argv);
}

// parseFlagToolArgs 把 --key value 或 --key=value 风格的参数解析成工具入参对象。
function parseFlagToolArgs(argv: string[]): ParsedToolArgs {
  const toolArgs: Record<string, unknown> = {};
  let apiKey: string | undefined;
  let json = false;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const currentArg = argv[index];
    if (!currentArg?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${currentArg}`);
    }

    const trimmedArg = currentArg.slice(2);
    if (trimmedArg === "") {
      throw new Error("Flag name cannot be empty");
    }

    if (trimmedArg === "help" || trimmedArg === "h") {
      help = true;
      continue;
    }

    const equalIndex = trimmedArg.indexOf("=");
    const flagName = equalIndex >= 0 ? trimmedArg.slice(0, equalIndex) : trimmedArg;
    const inlineValue = equalIndex >= 0 ? trimmedArg.slice(equalIndex + 1) : undefined;

    let rawValue: string;
    if (inlineValue !== undefined) {
      rawValue = inlineValue;
    } else {
      const nextArg = argv[index + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        rawValue = "true";
      } else {
        rawValue = nextArg;
        index += 1;
      }
    }

    if (flagName === "apikey") {
      apiKey = rawValue.trim() || undefined;
      continue;
    }

    if (flagName === "json") {
      json = rawValue.trim().toLowerCase() !== "false";
      continue;
    }

    toolArgs[flagName] = coerceCliValue(rawValue);
  }

  return {
    toolArgs,
    apiKey,
    json,
    help,
  };
}

// coerceCliValue 根据常见命令行输入模式把字符串转换成更适合 tool 消费的值。
function coerceCliValue(rawValue: string): unknown {
  const trimmedValue = rawValue.trim();
  if (trimmedValue === "") {
    return "";
  }

  if (looksLikeStructuredJsonString(trimmedValue)) {
    return trimmedValue;
  }

  if (trimmedValue.includes(",")) {
    return trimmedValue
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .map((item) => coerceCliScalar(item));
  }

  return coerceCliScalar(trimmedValue);
}

// coerceCliScalar 把单个 flag 值转换成布尔、数字或保留为字符串。
function coerceCliScalar(rawValue: string): unknown {
  const normalizedValue = rawValue.trim();
  const lowercaseValue = normalizedValue.toLowerCase();

  if (lowercaseValue === "true") {
    return true;
  }

  if (lowercaseValue === "false") {
    return false;
  }

  return normalizedValue;
}

// looksLikeStructuredJsonString 判断字符串是否应当保留为 JSON 文本而不是继续拆分成数组。
function looksLikeStructuredJsonString(value: string): boolean {
  return (
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith("{") && value.endsWith("}"))
  );
}

// mergeApiKeyIntoArgs 在提供或读取到 apikey 时自动补齐 tool 的 apiKey 参数。
export function mergeApiKeyIntoArgs(
  toolArgs: Record<string, unknown>,
  apiKey?: string,
): Record<string, unknown> {
  if (!apiKey) {
    return toolArgs;
  }

  return {
    ...toolArgs,
    apiKey,
  };
}

// coerceToolArgsBySchema 按工具 inputSchema 把 CLI 输入进一步收敛成真实业务类型。
function coerceToolArgsBySchema(
  toolArgs: Record<string, unknown>,
  inputSchema: Record<string, unknown>,
): Record<string, unknown> {
  const properties =
    inputSchema && typeof inputSchema === "object" && !Array.isArray(inputSchema)
      ? (inputSchema["properties"] as Record<string, unknown> | undefined)
      : undefined;

  if (!properties) {
    return toolArgs;
  }

  return Object.fromEntries(
    Object.entries(toolArgs).map(([key, value]) => [
      key,
      coerceValueBySchema(value, properties[key]),
    ]),
  );
}

// coerceValueBySchema 根据字段 schema 把字符串数字、布尔字符串和数组项转换成真实类型。
function coerceValueBySchema(value: unknown, schema: unknown): unknown {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return value;
  }

  const schemaRecord = schema as Record<string, unknown>;
  const normalizedType = Array.isArray(schemaRecord["type"])
    ? schemaRecord["type"][0]
    : schemaRecord["type"];

  if (normalizedType === "array") {
    const itemSchema = !Array.isArray(schemaRecord["items"])
      ? schemaRecord["items"]
      : undefined;
    const rawItems = Array.isArray(value) ? value : [value];
    return rawItems.map((item) => coerceValueBySchema(item, itemSchema));
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const properties =
      schemaRecord["properties"] &&
      typeof schemaRecord["properties"] === "object" &&
      !Array.isArray(schemaRecord["properties"])
        ? (schemaRecord["properties"] as Record<string, unknown>)
        : undefined;

    if (!properties) {
      return value;
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        coerceValueBySchema(childValue, properties[childKey]),
      ]),
    );
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (trimmedValue === "") {
      return value;
    }

    if (normalizedType === "integer" && /^-?\d+$/.test(trimmedValue)) {
      return Number.parseInt(trimmedValue, 10);
    }

    if (normalizedType === "number" && /^-?\d+(?:\.\d+)?$/.test(trimmedValue)) {
      return Number.parseFloat(trimmedValue);
    }

    if (normalizedType === "boolean") {
      const lowercaseValue = trimmedValue.toLowerCase();
      if (lowercaseValue === "true") {
        return true;
      }
      if (lowercaseValue === "false") {
        return false;
      }
    }
  }

  const candidateSchemas = [
    ...(Array.isArray(schemaRecord["anyOf"]) ? schemaRecord["anyOf"] : []),
    ...(Array.isArray(schemaRecord["oneOf"]) ? schemaRecord["oneOf"] : []),
  ];

  for (const candidateSchema of candidateSchemas) {
    const coercedValue = coerceValueBySchema(value, candidateSchema);
    if (coercedValue !== value) {
      return coercedValue;
    }
  }

  return value;
}

// handleAuthCommand 执行本地 apikey 的保存、查看与清理命令。
function handleAuthCommand(
  parsedArgs: Extract<ParsedArgs, { command: "auth" }>,
  homeDir: string = homedir(),
): void {
  const payload =
    parsedArgs.action === "set"
      ? {
          ok: true,
          action: "set",
          configPath: getLocalConfigPath(homeDir),
          apiKeyPreview: maskApiKey(parsedArgs.apiKey),
        }
      : parsedArgs.action === "clear"
        ? {
            ok: true,
            action: "clear",
            configPath: getLocalConfigPath(homeDir),
          }
        : {
            ok: true,
            action: "show",
            configPath: getLocalConfigPath(homeDir),
            hasApiKey: Boolean(readLocalConfig(homeDir).apiKey),
            apiKeyPreview: maskApiKey(readLocalConfig(homeDir).apiKey),
            alertDogBaseUrl: loadCoreConfig().alertDogBaseUrl,
            mctBackendBaseUrl: loadCoreConfig().mctBackendBaseUrl,
          };

  if (parsedArgs.action === "set") {
    setSavedApiKey(parsedArgs.apiKey, homeDir);
    renderAuthResult(payload, parsedArgs.json);
    return;
  }

  if (parsedArgs.action === "clear") {
    clearSavedApiKey(homeDir);
    renderAuthResult(payload, parsedArgs.json);
    return;
  }
  renderAuthResult(payload, parsedArgs.json);
}

// buildRunToolCommandContext 构造统一的工具执行上下文，并校验 tool 是否已经在 registry 中注册。
export function buildRunToolCommandContext(
  parsedArgs: Extract<ParsedArgs, { command: "run" }>,
): ToolCommandContext {
  const toolSpec = getToolSpec(parsedArgs.toolName);

  return {
    toolName: parsedArgs.toolName,
    toolArgs: coerceToolArgsBySchema(
      parsedArgs.toolArgs,
      toolSpec.inputSchema as Record<string, unknown>,
    ),
  };
}

// renderHelp 按主题输出 CLI 或单个工具的帮助信息。
function renderHelp(parsedArgs: Extract<ParsedArgs, { command: "help" }> | Extract<ParsedArgs, { command: "run"; help?: boolean }> | Extract<ParsedArgs, { command: "list-tools"; help?: boolean }>): void {
  if ("toolName" in parsedArgs && parsedArgs.toolName) {
    renderToolHelp(parsedArgs.toolName);
    return;
  }

  if ("topic" in parsedArgs && parsedArgs.topic === "auth") {
    process.stdout.write(`auth\n----\nUsage:\n  alertdog auth set --apikey=<value>\n  alertdog auth show\n  alertdog auth clear\n`);
    return;
  }

  if ("command" in parsedArgs && parsedArgs.command === "list-tools") {
    process.stdout.write(`list-tools\n----------\nUsage:\n  alertdog list-tools\n  alertdog list-tools --json\n`);
    return;
  }

  process.stdout.write(`alertdog\n--------\nUsage:\n  alertdog list-tools [--json]\n  alertdog run <tool-name> [json-args]\n  alertdog run <tool-name> [--key value | --key=value]\n  alertdog run <tool-name> --help\n  alertdog <tool-name> [json-args]\n  alertdog <tool-name> [--key value | --key=value]\n  alertdog <tool-name> --help\n  alertdog auth <set|show|clear> [--apikey=<value>]\n\nNotes:\n  Authenticated tools load apiKey from local config after 'alertdog auth set --apikey=<value>'.\n  Do not pass --apikey on normal 'alertdog run <tool-name>' calls.\n`);
}

// runToolCommand 执行单个 tool 调用，供 run/call 入口统一复用。
export async function runToolCommand(
  commandContext: ToolCommandContext,
): Promise<Record<string, unknown>> {
  const alertDogRuntime = createDefaultAlertDogToolRuntime();

  return alertDogRuntime.run(
    commandContext.toolName,
    commandContext.toolArgs,
  );
}
export async function main(): Promise<void> {
  printRuntimeVersion("cli", CLI_VERSION);
  const homeDir = homedir();
  const parsedArgs = parseArgs(process.argv.slice(2), process.env, homeDir);

  if (parsedArgs.command === "help") {
    renderHelp(parsedArgs);
    return;
  }

  if (parsedArgs.command === "auth") {
    handleAuthCommand(parsedArgs, homeDir);
    return;
  }

  if (parsedArgs.command === "list-tools") {
    if (parsedArgs.help) {
      renderHelp(parsedArgs);
      return;
    }
    const alertDogRuntime = createDefaultAlertDogToolRuntime();
    const result = alertDogRuntime.listTools();
    renderListToolsResult(result, parsedArgs.json);
    return;
  }

  if (parsedArgs.help) {
    renderHelp(parsedArgs);
    return;
  }

  const commandContext = buildRunToolCommandContext(parsedArgs);
  const result = await runToolCommand(commandContext);
  renderToolResult(commandContext.toolName, result, parsedArgs.json);
}
