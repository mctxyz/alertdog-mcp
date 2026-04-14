import { getToolSpec } from "@alertdog/core";

import {
  printJson,
  printSection,
} from "../formatter.js";
import { renderCexMonitorToolResult } from "./render-cex-monitor.js";
import { renderUnknownValue } from "./render-helpers.js";

// renderToolResult 根据工具结果输出更适合终端阅读的友好格式。
export function renderToolResult(
  toolName: string,
  result: Record<string, unknown>,
  json: boolean,
): void {
  if (json) {
    printJson(result);
    return;
  }

  const toolSpec = getToolSpec(toolName);
  printSection(`${toolName} (${toolSpec.category})`);
  if (renderSpecializedToolResult(toolName, result)) {
    if (result.ok === false) {
      process.exitCode = 1;
    }
    return;
  }
  renderUnknownValue(result, 0);

  if (result.ok === false) {
    process.exitCode = 1;
  }
}

// renderSpecializedToolResult 为复杂工具结果提供更稳定的专用终端布局。
function renderSpecializedToolResult(
  toolName: string,
  result: Record<string, unknown>,
): boolean {
  if (renderCexMonitorToolResult(toolName, result)) {
    return true;
  }

  return false;
}
