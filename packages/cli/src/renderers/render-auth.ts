import {
  printJson,
  printSection,
} from "../formatter.js";
import { renderUnknownValue } from "./render-helpers.js";

// renderAuthResult 按友好格式输出 auth 子命令结果。
export function renderAuthResult(result: Record<string, unknown>, json: boolean): void {
  if (json) {
    printJson(result);
    return;
  }

  printSection(`auth ${String(result.action ?? "")}`.trim());
  renderUnknownValue(result, 0);
}
