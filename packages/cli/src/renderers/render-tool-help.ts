import { getToolSpec } from "@alertdog/core";

import {
  outputLine,
  printBulletList,
  printSection,
} from "../formatter.js";
import {
  formatScalarValue,
  isRecord,
} from "./render-helpers.js";

// renderToolHelp 输出单个工具的帮助信息，包括参数说明与示例。
export function renderToolHelp(toolName: string): void {
  const toolSpec = getToolSpec(toolName);
  printSection(`${toolSpec.name} (${toolSpec.category})`);
  outputLine(toolSpec.description);
  outputLine("");
  outputLine(`requiresApiKey: ${String(toolSpec.requiresApiKey)}`);
  outputLine(`sideEffect: ${String(toolSpec.sideEffect)}`);
  outputLine(`riskLevel: ${toolSpec.riskLevel}`);

  if (toolSpec.recommendedBefore.length > 0) {
    outputLine("");
    outputLine("recommendedBefore:");
    printBulletList(toolSpec.recommendedBefore.map((item) => item), 2);
  }

  if (toolSpec.conditionalRules.length > 0) {
    outputLine("");
    outputLine("conditionalRules:");
    printBulletList(
      toolSpec.conditionalRules.map((item) => `${item.when}: ${item.message}`),
      2,
    );
  }

  const parameterLines = buildParameterLines(toolSpec.inputSchema);
  if (parameterLines.length > 0) {
    outputLine("");
    outputLine("parameters:");
    printBulletList(parameterLines, 2);
  }

  if (toolSpec.examples.length > 0) {
    outputLine("");
    outputLine("examples:");
    for (const example of toolSpec.examples) {
      outputLine(`- ${example.title}`);
      if (example.args) {
        const exampleEntries = Object.entries(example.args).map(
          ([key, value]) => `${key}=${formatScalarValue(value)}`,
        );
        printBulletList(exampleEntries, 2);
      }
    }
  }
}

// buildParameterLines 把 inputSchema 整理成每个参数一行的帮助输出。
function buildParameterLines(inputSchema: unknown): string[] {
  if (!isRecord(inputSchema) || !isRecord(inputSchema["properties"])) {
    return [];
  }

  const properties = inputSchema["properties"] as Record<string, unknown>;
  const requiredFields = Array.isArray(inputSchema["required"])
    ? new Set(
        inputSchema["required"].filter((item): item is string => typeof item === "string"),
      )
    : new Set<string>();

  return Object.entries(properties).map(([fieldName, fieldSchema]) =>
    formatParameterLine(fieldName, fieldSchema, requiredFields.has(fieldName)),
  );
}

// formatParameterLine 生成单个参数的一行帮助说明。
function formatParameterLine(
  fieldName: string,
  fieldSchema: unknown,
  required: boolean,
): string {
  if (!isRecord(fieldSchema)) {
    return `${fieldName} [${required ? "required" : "optional"}]`;
  }

  const typeSummary = summarizeSchemaType(fieldSchema);
  const detailSummary = summarizeSchemaDetails(fieldSchema);
  const description =
    typeof fieldSchema["description"] === "string" ? fieldSchema["description"] : "";

  return [
    `${fieldName}`,
    `(${required ? "required" : "optional"})`,
    typeSummary ? `<${typeSummary}>` : "",
    detailSummary ? `${detailSummary}` : "",
    description ? `: ${description}` : "",
  ]
    .filter((item) => item !== "")
    .join(" ");
}

// summarizeSchemaType 生成字段 schema 的紧凑类型摘要。
function summarizeSchemaType(schema: Record<string, unknown>): string {
  const normalizedType = Array.isArray(schema["type"])
    ? schema["type"].filter((item): item is string => typeof item === "string").join("|")
    : typeof schema["type"] === "string"
      ? schema["type"]
      : "";

  if (normalizedType) {
    if (normalizedType === "array" && isRecord(schema["items"])) {
      return `array<${summarizeSchemaType(schema["items"] as Record<string, unknown>) || "unknown"}>`;
    }
    return normalizedType;
  }

  if (Array.isArray(schema["enum"]) && schema["enum"].length > 0) {
    return "enum";
  }

  if (schema["const"] !== undefined) {
    return "const";
  }

  if (Array.isArray(schema["anyOf"]) && schema["anyOf"].length > 0) {
    return "union";
  }

  if (Array.isArray(schema["oneOf"]) && schema["oneOf"].length > 0) {
    return "union";
  }

  return "";
}

// summarizeSchemaDetails 生成枚举值、范围和值约束的简短摘要。
function summarizeSchemaDetails(schema: Record<string, unknown>): string {
  if (Array.isArray(schema["enum"]) && schema["enum"].length > 0) {
    return `allowed=${schema["enum"].map((item) => String(item)).join(",")}`;
  }

  if (schema["const"] !== undefined) {
    return `value=${String(schema["const"])}`;
  }

  const unionSchemas = Array.isArray(schema["anyOf"])
    ? schema["anyOf"]
    : Array.isArray(schema["oneOf"])
      ? schema["oneOf"]
      : [];
  if (unionSchemas.length > 0) {
    const unionSummary = unionSchemas
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => summarizeSchemaDetails(item) || summarizeSchemaType(item))
      .filter((item) => item !== "")
      .join(" | ");
    if (unionSummary) {
      return `allowed=${unionSummary}`;
    }
  }

  const details: string[] = [];
  if (typeof schema["minimum"] === "number") {
    details.push(`min=${schema["minimum"]}`);
  }
  if (typeof schema["exclusiveMinimum"] === "number") {
    details.push(`>${schema["exclusiveMinimum"]}`);
  }
  if (typeof schema["maximum"] === "number") {
    details.push(`max=${schema["maximum"]}`);
  }
  if (typeof schema["exclusiveMaximum"] === "number") {
    details.push(`<${schema["exclusiveMaximum"]}`);
  }
  if (typeof schema["minLength"] === "number") {
    details.push(`minLength=${schema["minLength"]}`);
  }
  if (typeof schema["maxLength"] === "number") {
    details.push(`maxLength=${schema["maxLength"]}`);
  }
  if (typeof schema["minItems"] === "number") {
    details.push(`minItems=${schema["minItems"]}`);
  }
  if (typeof schema["maxItems"] === "number") {
    details.push(`maxItems=${schema["maxItems"]}`);
  }

  return details.join(", ");
}
