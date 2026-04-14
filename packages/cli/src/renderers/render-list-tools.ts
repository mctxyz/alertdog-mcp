import { getToolSpec } from "@alertdog/core";

import {
  printJson,
  printSection,
  printTable,
} from "../formatter.js";
import {
  isRecord,
  renderUnknownValue,
  summarizeDescription,
} from "./render-helpers.js";

// renderListToolsResult 按表格输出工具清单。
export function renderListToolsResult(tools: unknown, json: boolean): void {
  if (json) {
    printJson(tools);
    return;
  }

  const normalizedTools = extractToolRows(tools);
  if (!normalizedTools) {
    renderUnknownValue(tools, 0);
    return;
  }

  printSection("Available Tools");
  printTable(
    normalizedTools.map((item) => {
      const row: Record<string, unknown> = isRecord(item) ? item : { value: item };
      const toolName = typeof row["name"] === "string" ? row["name"] : "";
      const toolSpec = toolName ? getToolSpec(toolName) : null;
      return {
        name: row["name"],
        category: row["category"] ?? toolSpec?.category,
        requiresApiKey: row["requiresApiKey"] ?? toolSpec?.requiresApiKey,
        sideEffect: row["sideEffect"] ?? toolSpec?.sideEffect,
        riskLevel: row["riskLevel"] ?? toolSpec?.riskLevel,
        description: summarizeDescription(
          typeof row["description"] === "string"
            ? row["description"]
            : toolSpec?.description,
        ),
      };
    }),
  );
}

// extractToolRows 兼容 list-tools 直接返回数组或 { tools: [...] } 两种结构。
function extractToolRows(tools: unknown): unknown[] | null {
  if (Array.isArray(tools)) {
    return tools;
  }

  if (isRecord(tools) && Array.isArray(tools["tools"])) {
    return tools["tools"] as unknown[];
  }

  return null;
}
