import {
  AlertDogClient,
  type AlertDogUserAPIKeyRecord,
} from "../../api/alertdog.js";
import type {
  AlertDogToolRegistration,
  ToolExecutorMap,
  ToolPayload,
} from "../tool-types.js";
import { createExecutorsFromRegistrations } from "../tools/common.js";
import {
  isAlertDogBusinessMessage,
  normalizeAlertDogToolError,
} from "./helpers/alertdog-tool.js";
import { requireString } from "./helpers/input-tool.js";


import { defineAlertDogToolSpec } from "./define-tool-contract.js";

export const APIKEY_TOOL_REGISTRATIONS: AlertDogToolRegistration<AlertDogClient>[] = [
  defineAlertDogToolSpec<AlertDogClient>({
    name: "apikey_usage_guide",
    description:
      "Use this tool when the user does not know how to get started with AlertDog MCP or is unsure how apiKey should be provided. This tool only returns usage guidance and does not read or modify any user data.",
    inputSchema: {},
    requiresApiKey: false,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "apikey",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "Read the onboarding steps before the first authenticated call",
      },
    ],
    handler: async () => ({
      ok: true,
      steps: [
        "先在 AlertDog 官方产品侧创建用户自己的 apikey。",
        "调用本地 stdio 或 cli 工具时，把该 apikey 作为 apiKey 参数传入。",
        "本地工具运行时会将 apiKey 转发为 AlertDog 的 X-Api-Key 请求头。",
      ],
    }),
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "apikey_get",
    description:
      "Use this tool when the user wants to validate the current AlertDog apiKey or inspect apiKey details. This is a read-only operation and does not modify the existing apiKey. If the user is just starting the setup flow, prefer apikey_usage_guide first.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
      },
      required: ["apiKey"],
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "apikey",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "Validate the current apiKey",
        args: {
          apiKey: "user-api-key",
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const apiKey = requireString(rawArgs.apiKey, "apiKey");
        const record = await client.getUserAPIKey({ apiKey });
        return {
          ok: true,
          exists: true,
          apiKey: toAPIKeyPayload(record),
        };
      } catch (error) {
        if (isAlertDogBusinessMessage(error, "apikey 不存在")) {
          return {
            ok: true,
            exists: false,
            apiKey: null,
          };
        }
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "apikey_create",
    description:
      "Use this tool when the user needs to create a new AlertDog apiKey for the current account. This is a write operation with side effects. If an apiKey may already exist and the user only wants to inspect it, prefer apikey_get first.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
      },
      required: ["apiKey"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "apikey",
    recommendedBefore: ["apikey_get"],
    conditionalRules: [],
    examples: [
      {
        title: "Create a new apiKey for the current user account",
        args: {
          apiKey: "user-api-key",
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const apiKey = requireString(rawArgs.apiKey, "apiKey");
        const record = await client.createUserAPIKey({ apiKey });
        return {
          ok: true,
          created: true,
          apiKey: toAPIKeyPayload(record),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "apikey_regenerate",
    description:
      "Use this tool only when the user explicitly wants to rotate, reset, or regenerate their AlertDog apiKey. This is a write operation with side effects. If the user only wants to check whether the current apiKey is valid, prefer apikey_get first.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
      },
      required: ["apiKey"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "dangerous",
    category: "apikey",
    recommendedBefore: ["apikey_get"],
    conditionalRules: [],
    examples: [
      {
        title: "Rotate the apiKey only when the user explicitly asks for it",
        args: {
          apiKey: "user-api-key",
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const apiKey = requireString(rawArgs.apiKey, "apiKey");
        const record = await client.regenerateUserAPIKey({ apiKey });
        return {
          ok: true,
          regenerated: true,
          apiKey: toAPIKeyPayload(record),
        };
      } catch (error) {
        if (isAlertDogBusinessMessage(error, "apikey 不存在")) {
          return {
            ok: true,
            regenerated: false,
            reason: "not_found",
          };
        }
        return normalizeAlertDogToolError(error);
      }
    },
  }),
];

export const APIKEY_TOOL_SPECS = APIKEY_TOOL_REGISTRATIONS;

// createApiKeyToolExecutors 创建 apikey 相关的本地直连工具执行器。
export function createApiKeyToolExecutors(client: AlertDogClient): ToolExecutorMap {
  return createExecutorsFromRegistrations(client, APIKEY_TOOL_REGISTRATIONS);
}

// toAPIKeyPayload 把 AlertDog 记录转换成更适合模型消费的结构。
function toAPIKeyPayload(record: AlertDogUserAPIKeyRecord): ToolPayload {
  return {
    id: record.id,
    userId: record.user_id,
    value: record.api_key,
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
  };
}
