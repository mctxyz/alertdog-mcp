import {
  AlertDogClient,
  type AlertDogNotifyChannelCreatePayload,
  type AlertDogNotifyChannelRecord,
} from "../../api/alertdog.js";
import type {
  AlertDogToolRegistration,
  ToolExecutorMap,
  ToolPayload,
} from "../tool-types.js";
import { createExecutorsFromRegistrations } from "../tools/common.js";
import { defineAlertDogToolSpec } from "./define-tool-contract.js";
import {
  normalizeAlertDogToolError,
} from "./helpers/alertdog-tool.js";
import { requireString } from "./helpers/input-tool.js";

export const NOTIFY_CHANNEL_TYPE_VALUES = [
  "telegram",
  "discord",
  "dingtalk",
  "feishu",
  "wecom",
  "webhook",
  "bark",
];


interface NotifyChannelCreateArgs {
  apiKey: string;
  channelType: "telegram" | "discord" | "dingtalk" | "feishu" | "wecom" | "webhook" | "bark";
  name: string;
  chatId?: string;
  webhookUrl?: string;
  secretKey?: string;
}

interface NotifyChannelIDArgs {
  apiKey: string;
  id: number;
}

export const NOTIFY_CHANNEL_TOOL_REGISTRATIONS: AlertDogToolRegistration<AlertDogClient>[] = [
  defineAlertDogToolSpec<AlertDogClient>({
    name: "notify_channel_list",
    description:
      "Use this tool when the user wants to list the notification channels available in the current AlertDog account. This is a read-only operation and does not modify any notification channel.",
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
    category: "notify-channel",
    recommendedBefore: [],
    conditionalRules: [],
    examples: [
      {
        title: "List notification channels in the current account",
        args: {
          apiKey: "user-api-key",
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeNotifyChannelListArgs(rawArgs);
        const channels = await client.listNotifyChannels({ apiKey: args.apiKey });
        return {
          ok: true,
          count: channels.length,
          channels: channels.map(toNotifyChannelPayload),
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "notify_channel_create",
    description:
      'Use this tool only when the user explicitly wants to create a new notification channel in the current AlertDog account. This is a write operation with side effects. Depending on channelType, it can create Telegram, Discord, DingTalk, Feishu, WeCom, Webhook, or Bark channels. For DingTalk and Feishu, secretKey is required and webhookUrl must be a JSON array string such as [{"webhook":"https://...","key":"secret"}].',
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        channelType: {
          type: "string",
          enum: [...NOTIFY_CHANNEL_TYPE_VALUES],
          description:
            "Notification channel type. Supported values: telegram, discord, dingtalk, feishu, wecom, webhook, bark.",
        },
        name: {
          type: "string",
          minLength: 1,
          description: "Notification channel display name.",
        },
        chatId: {
          type: "string",
          description: "chat_id required by Telegram channels.",
        },
        webhookUrl: {
          type: "string",
          description:
            'webhook_url required by Discord, WeCom, Webhook, and Bark channels. DingTalk and Feishu require a JSON array string such as [{"webhook":"https://...","key":"secret"}].',
        },
        secretKey: {
          type: "string",
          description:
            "Signing secret required by DingTalk and Feishu channels. It must still be provided explicitly even if webhookUrl already contains key values inside the JSON array string.",
        },
      },
      required: ["apiKey", "channelType", "name"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "notify-channel",
    recommendedBefore: ["notify_channel_list"],
    conditionalRules: [
      {
        when: "channelType=telegram",
        requiredFields: ["chatId"],
        message: "Telegram channels require chatId.",
      },
      {
        when: "channelType in [discord,wecom,webhook,bark]",
        requiredFields: ["webhookUrl"],
        message: "Discord, WeCom, Webhook, and Bark channels require webhookUrl.",
      },
      {
        when: "channelType in [dingtalk,feishu]",
        requiredFields: ["webhookUrl", "secretKey"],
        message:
          'DingTalk and Feishu channels require both webhookUrl and secretKey, and webhookUrl must be a JSON array string like [{"webhook":"...","key":"..."}].',
      },
    ],
    examples: [
      {
        title: "Create a Telegram notification channel",
        args: {
          apiKey: "user-api-key",
          channelType: "telegram",
          name: "Ops Telegram",
          chatId: "123456",
        },
      },
      {
        title: "Create a WeCom notification channel",
        args: {
          apiKey: "user-api-key",
          channelType: "wecom",
          name: "Ops WeCom",
          webhookUrl: "https://example.com",
        },
      },
      {
        title: "Create a DingTalk notification channel",
        args: {
          apiKey: "user-api-key",
          channelType: "dingtalk",
          name: "Ops DingTalk",
          webhookUrl:
            '[{"webhook":"https://example.com/hook","key":"secret"}]',
          secretKey: "secret",
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeNotifyChannelCreateArgs(rawArgs);
        const payload = buildNotifyChannelCreatePayload(args);
        const result = await client.createNotifyChannel({ apiKey: args.apiKey }, payload);
        return {
          ok: true,
          created: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "notify_channel_bound_monitor_count",
    description:
      "Use this tool when the user wants to inspect how many monitors are currently bound to a notification channel. This is a read-only operation and does not modify any notification channel or monitor configuration.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        id: {
          anyOf: [
            {
              type: "integer",
              exclusiveMinimum: 0,
            },
            {
              type: "string",
              minLength: 1,
            },
          ],
          description:
            "Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer.",
        },
      },
      required: ["apiKey", "id"],
    },
    requiresApiKey: true,
    sideEffect: false,
    safeToRetry: true,
    riskLevel: "safe",
    category: "notify-channel",
    recommendedBefore: ["notify_channel_list"],
    conditionalRules: [],
    examples: [
      {
        title: "Inspect how many monitors are bound to a channel",
        args: {
          apiKey: "user-api-key",
          id: 1,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeNotifyChannelIdArgs(rawArgs);
        const result = await client.getNotifyChannelBoundMonitorCount(
          { apiKey: args.apiKey },
          args.id,
        );
        return {
          ok: true,
          id: args.id,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "notify_channel_delete",
    description:
      "Use this tool only when the user explicitly wants to delete a notification channel. This is a write operation with side effects and will delete the specified channel.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        id: {
          anyOf: [
            {
              type: "integer",
              exclusiveMinimum: 0,
            },
            {
              type: "string",
              minLength: 1,
            },
          ],
          description:
            "Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer.",
        },
      },
      required: ["apiKey", "id"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "dangerous",
    category: "notify-channel",
    recommendedBefore: ["notify_channel_list"],
    conditionalRules: [],
    examples: [
      {
        title: "Delete a notification channel",
        args: {
          apiKey: "user-api-key",
          id: 1,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeNotifyChannelIdArgs(rawArgs);
        const result = await client.deleteNotifyChannel({ apiKey: args.apiKey }, args.id);
        return {
          ok: true,
          id: args.id,
          deleted: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "notify_channel_set_default",
    description:
      "Use this tool only when the user explicitly wants to set a notification channel as the default channel. This is a write operation with side effects and will modify the default notification configuration.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        id: {
          anyOf: [
            {
              type: "integer",
              exclusiveMinimum: 0,
            },
            {
              type: "string",
              minLength: 1,
            },
          ],
          description:
            "Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer.",
        },
      },
      required: ["apiKey", "id"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "notify-channel",
    recommendedBefore: ["notify_channel_list"],
    conditionalRules: [],
    examples: [
      {
        title: "Set a notification channel as the default channel",
        args: {
          apiKey: "user-api-key",
          id: 1,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeNotifyChannelIdArgs(rawArgs);
        const result = await client.setDefaultNotifyChannel({ apiKey: args.apiKey }, args.id);
        return {
          ok: true,
          id: args.id,
          isDefault: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
  defineAlertDogToolSpec<AlertDogClient>({
    name: "notify_channel_send_test",
    description:
      "Use this tool when the user wants to send a test message through a notification channel to verify connectivity. This is a write operation with side effects and sends one test notification.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          minLength: 1,
          description:
            "The apiKey created by the user in the AlertDog product. It must be provided for any authenticated tool call.",
        },
        id: {
          anyOf: [
            {
              type: "integer",
              exclusiveMinimum: 0,
            },
            {
              type: "string",
              minLength: 1,
            },
          ],
          description:
            "Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer.",
        },
      },
      required: ["apiKey", "id"],
    },
    requiresApiKey: true,
    sideEffect: true,
    safeToRetry: false,
    riskLevel: "caution",
    category: "notify-channel",
    recommendedBefore: ["notify_channel_list"],
    conditionalRules: [],
    examples: [
      {
        title: "Send a test message through a notification channel",
        args: {
          apiKey: "user-api-key",
          id: 1,
        },
      },
    ],
    handler: async (client, rawArgs = {}) => {
      try {
        const args = normalizeNotifyChannelIdArgs(rawArgs);
        const result = await client.sendNotifyChannelTest({ apiKey: args.apiKey }, args.id);
        return {
          ok: true,
          id: args.id,
          tested: true,
          result,
        };
      } catch (error) {
        return normalizeAlertDogToolError(error);
      }
    },
  }),
];

export const NOTIFY_CHANNEL_TOOL_SPECS = NOTIFY_CHANNEL_TOOL_REGISTRATIONS;

// createNotifyChannelToolExecutors 创建通知渠道相关的本地直连工具执行器。
export function createNotifyChannelToolExecutors(
  client: AlertDogClient,
): ToolExecutorMap {
  return createExecutorsFromRegistrations(client, NOTIFY_CHANNEL_TOOL_REGISTRATIONS);
}

// toNotifyChannelPayload 把通知频道记录转换成更适合模型消费的结构。
function toNotifyChannelPayload(record: AlertDogNotifyChannelRecord): ToolPayload {
  return {
    id: record.id,
    userId: record.user_id,
    channel: record.channel_id,
    name: record.name,
    lastSend: record.last_send,
    failedStart: record.failed_start,
    failedCount: record.failed_count,
    failedStage: record.failed_stage,
    failedAvail: record.failed_avail,
    disabled: record.disabled,
    disabledReason: record.disabled_reason,
    isDefault: record.is_default,
  };
}

// buildNotifyChannelCreatePayload 根据渠道类型组装 create 接口真实请求体。
function buildNotifyChannelCreatePayload(
  args: NotifyChannelCreateArgs,
): AlertDogNotifyChannelCreatePayload {
  switch (args.channelType) {
    case "telegram":
      return {
        channel_id: "telegram",
        name: args.name,
        chat_id: requireDefinedString(args.chatId, "chatId"),
      };
    case "discord":
      return {
        channel_id: "discord",
        id: 0,
        name: args.name,
        webhook_url: requireDefinedString(args.webhookUrl, "webhookUrl"),
      };
    case "dingtalk":
      return {
        channel_id: "dingtalk",
        id: 0,
        name: args.name,
        webhook_url: buildWebhookPayload(
          requireDefinedString(args.webhookUrl, "webhookUrl"),
          requireDefinedString(args.secretKey, "secretKey"),
        ),
      };
    case "feishu":
      return {
        channel_id: "feishu",
        id: 0,
        name: args.name,
        webhook_url: buildWebhookPayload(
          requireDefinedString(args.webhookUrl, "webhookUrl"),
          requireDefinedString(args.secretKey, "secretKey"),
        ),
      };
    case "wecom":
      return {
        channel_id: "wecom",
        id: 0,
        name: args.name,
        webhook_url: requireDefinedString(args.webhookUrl, "webhookUrl"),
      };
    case "webhook":
      return {
        channel_id: "webhook",
        id: 0,
        name: args.name,
        webhook_url: requireDefinedString(args.webhookUrl, "webhookUrl"),
      };
    case "bark":
      return {
        channel_id: "bark",
        id: 0,
        name: args.name,
        webhook_url: requireDefinedString(args.webhookUrl, "webhookUrl"),
      };
  }
}

// normalizeNotifyChannelCreateArgs 校验并收窄工具层传入的创建参数。
function normalizeNotifyChannelCreateArgs(rawArgs: Record<string, unknown>): NotifyChannelCreateArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    channelType: requireChannelType(rawArgs.channelType),
    name: requireString(rawArgs.name, "name"),
    chatId: optionalUnknownString(rawArgs.chatId),
    webhookUrl: optionalUnknownString(rawArgs.webhookUrl),
    secretKey: optionalUnknownString(rawArgs.secretKey),
  };
}

// normalizeNotifyChannelListArgs 校验并收窄列表工具传入的参数。
function normalizeNotifyChannelListArgs(rawArgs: Record<string, unknown>): { apiKey: string } {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
  };
}

// normalizeNotifyChannelIdArgs 校验并收窄带通知频道 id 的工具参数。
function normalizeNotifyChannelIdArgs(rawArgs: Record<string, unknown>): NotifyChannelIDArgs {
  return {
    apiKey: requireString(rawArgs.apiKey, "apiKey"),
    id: requirePositiveInt(rawArgs.id, "id"),
  };
}

// requireDefinedString 读取已收窄后的必填字符串参数，缺失时抛出业务错误。
function requireDefinedString(value: string | undefined, fieldName: string): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  throw new Error(`${fieldName} is required`);
}

// optionalUnknownString 从 unknown 值中读取可选字符串参数。
function optionalUnknownString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

// requirePositiveInt 从 unknown 值中读取正整数参数。
function requirePositiveInt(value: unknown, fieldName: string): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed !== "" && /^[0-9]+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      if (parsed > 0) {
        return parsed;
      }
    }
  }

  throw new Error(`${fieldName} must be a positive integer`);
}

// requireChannelType 校验 channelType 是否属于支持的渠道类型。
function requireChannelType(value: unknown): NotifyChannelCreateArgs["channelType"] {
  if (
    NOTIFY_CHANNEL_TYPE_VALUES.includes(
      value as (typeof NOTIFY_CHANNEL_TYPE_VALUES)[number],
    )
  ) {
    return value as NotifyChannelCreateArgs["channelType"];
  }

  throw new Error("channelType is required");
}

// buildWebhookPayload 校验钉钉与飞书所需的 webhook_url，要求传入后端接受的 JSON 数组字符串。
function buildWebhookPayload(webhookUrl: string, secretKey: string): string {
  void secretKey;

  if (!looksLikeWebhookArrayJson(webhookUrl)) {
    throw new Error(
      'webhookUrl must be a JSON array string like [{"webhook":"...","key":"..."}]',
    );
  }

  return webhookUrl;
}

// looksLikeWebhookArrayJson 判断 webhookUrl 是否已经是后端接受的 JSON 数组字符串。
function looksLikeWebhookArrayJson(value: string): boolean {
  try {
    return Array.isArray(JSON.parse(value));
  } catch {
    return false;
  }
}
