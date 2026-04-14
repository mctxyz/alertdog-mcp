import { EOL } from "node:os";

// outputLine 向标准输出写入一行文本。
export function outputLine(message: string = ""): void {
  process.stdout.write(`${message}${EOL}`);
}

// errorLine 向标准错误写入一行文本。
export function errorLine(message: string): void {
  process.stderr.write(`${message}${EOL}`);
}

// printJson 以格式化 JSON 输出结构化结果。
export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}${EOL}`);
}

// printSection 输出带标题的分区，方便终端阅读。
export function printSection(title: string, indent: number = 0): void {
  const pad = " ".repeat(indent);
  outputLine(`${pad}${title}`);
  outputLine(`${pad}${"-".repeat(title.length)}`);
}

// printTable 按简单表格格式输出对象数组。
export function printTable(
  rows: Record<string, unknown>[],
  indent: number = 0,
): void {
  const pad = " ".repeat(indent);
  if (rows.length === 0) {
    outputLine(`${pad}(no data)`);
    return;
  }

  const keys = collectTableKeys(rows);
  const widths = keys.map((key) =>
    Math.max(
      key.length,
      ...rows.map((row) => stringifyCellValue(row[key]).length),
    ),
  );
  const header = `${pad}${keys.map((key, index) => key.padEnd(widths[index])).join("  ")}`;
  const divider = `${pad}${widths.map((width) => "-".repeat(width)).join("  ")}`;
  outputLine(header);
  outputLine(divider);
  for (const row of rows) {
    outputLine(
      `${pad}${keys
        .map((key, index) => stringifyCellValue(row[key]).padEnd(widths[index]))
        .join("  ")}`,
    );
  }
}

// printKv 递归输出键值对结构，适合对象详情展示。
export function printKv(obj: Record<string, unknown>, indent: number = 0): void {
  const pad = " ".repeat(indent);
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      outputLine(`${pad}${key}:`);
      printKv(value as Record<string, unknown>, indent + 2);
      continue;
    }

    outputLine(`${pad}${key}: ${stringifyCellValue(value)}`);
  }
}

// printBulletList 以简单列表形式输出多行文本。
export function printBulletList(items: string[], indent: number = 0): void {
  const pad = " ".repeat(indent);
  for (const item of items) {
    outputLine(`${pad}- ${item}`);
  }
}

// collectTableKeys 收集表格所有列名，兼容每行字段不完全一致的场景。
function collectTableKeys(rows: Record<string, unknown>[]): string[] {
  const keySet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      keySet.add(key);
    }
  }

  return [...keySet];
}

// stringifyCellValue 把未知值压缩成适合终端单元格展示的字符串。
function stringifyCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyCellValue(item)).join(", ");
  }

  return JSON.stringify(value);
}
