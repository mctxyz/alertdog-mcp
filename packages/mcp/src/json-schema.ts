import { z } from "zod/v4";

import type { ToolInputJsonSchema } from "@alertdog/core";

// isPlainObject 判断未知值是否为普通对象，避免把数组当成 JSON Schema 对象继续处理。
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// jsonSchemaToZod 使用 Zod 官方 experimental API 把 JSON Schema 转成运行时校验器。
export function jsonSchemaToZod(schema: ToolInputJsonSchema): z.ZodType {
  return z.fromJSONSchema(schema as Parameters<typeof z.fromJSONSchema>[0]);
}

// buildOptionalApiKeyJsonSchema 复制一份 JSON Schema，并把 apiKey 调整为本地可选。
export function buildOptionalApiKeyJsonSchema(schema: ToolInputJsonSchema): ToolInputJsonSchema {
  const properties = { ...(schema.properties ?? {}) };
  const apiKeySchema = isPlainObject(properties.apiKey)
    ? (properties.apiKey as ToolInputJsonSchema)
    : {};
  const requiredFields = (schema.required ?? []).filter((fieldName) => fieldName !== "apiKey");

  properties.apiKey = {
    ...apiKeySchema,
    description: `${apiKeySchema.description ?? "AlertDog apikey。"} 本地已保存时可省略。`,
  };

  return {
    ...schema,
    properties,
    required: requiredFields,
  };
}
