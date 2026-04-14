import {
  outputLine,
  printTable,
} from "../formatter.js";

// isRecord 判断未知值是否是普通对象。
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// formatScalarValue 把标量或复杂值转成可打印字符串。
export function formatScalarValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

// formatInlinePairs 把键值对数组压缩成 key=value, key=value 的单行格式。
export function formatInlinePairs(
  pairs: Array<[string, unknown]>,
): string {
  return pairs
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${formatScalarValue(value)}`)
    .join(", ");
}

// formatInlineRecord 把对象按 key=value, key=value 的单行格式输出。
export function formatInlineRecord(value: Record<string, unknown>): string {
  return formatInlinePairs(
    Object.entries(value).map(([key, entryValue]) => [key, entryValue]),
  );
}

// renderUnknownValue 递归渲染未知值，并尽量转换成表格、键值或列表。
export function renderUnknownValue(value: unknown, indent: number): void {
  if (Array.isArray(value)) {
    renderArrayValue(value, indent);
    return;
  }

  if (isRecord(value)) {
    renderObjectValue(value, indent);
    return;
  }

  outputLine(`${" ".repeat(indent)}${formatScalarValue(value)}`);
}

// renderArrayValue 渲染数组；对象数组优先走表格，标量数组走列表。
function renderArrayValue(items: unknown[], indent: number): void {
  if (items.length === 0) {
    outputLine(`${" ".repeat(indent)}(empty)`);
    return;
  }

  if (items.every((item) => isRecord(item) && isFlatRecord(item))) {
    const rows = items.map((item) => item as Record<string, unknown>);
    printTable(rows, indent);
    return;
  }

  for (const [index, item] of items.entries()) {
    if (isRecord(item)) {
      outputLine(`${" ".repeat(indent)}[${index + 1}]`);
      renderObjectValue(item, indent + 2);
      if (index < items.length - 1) {
        outputLine("");
      }
      continue;
    }

    if (Array.isArray(item)) {
      outputLine(`${" ".repeat(indent)}[${index + 1}]`);
      renderArrayValue(item, indent + 2);
      if (index < items.length - 1) {
        outputLine("");
      }
      continue;
    }

    outputLine(`${" ".repeat(indent)}- ${formatScalarValue(item)}`);
  }
}

// renderObjectValue 渲染对象，把标量字段、对象字段、数组字段分块输出。
function renderObjectValue(value: Record<string, unknown>, indent: number): void {
  const scalarEntries: Record<string, unknown> = {};
  const objectEntries: Array<[string, Record<string, unknown>]> = [];
  const arrayEntries: Array<[string, unknown[]]> = [];

  for (const [key, entryValue] of Object.entries(value)) {
    if (Array.isArray(entryValue)) {
      arrayEntries.push([key, entryValue]);
      continue;
    }

    if (isRecord(entryValue)) {
      objectEntries.push([key, entryValue]);
      continue;
    }

    scalarEntries[key] = entryValue;
  }

  if (Object.keys(scalarEntries).length > 0) {
    printKvWithIndent(scalarEntries, indent);
  }

  for (const [key, entryValue] of objectEntries) {
    if (Object.keys(scalarEntries).length > 0 || objectEntries[0]?.[0] !== key) {
      outputLine("");
    }
    outputLine(`${" ".repeat(indent)}${key}:`);
    renderObjectValue(entryValue, indent + 2);
  }

  for (const [key, entryValue] of arrayEntries) {
    if (
      Object.keys(scalarEntries).length > 0 ||
      objectEntries.length > 0 ||
      arrayEntries[0]?.[0] !== key
    ) {
      outputLine("");
    }
    outputLine(`${" ".repeat(indent)}${key}:`);
    renderArrayValue(entryValue, indent + 2);
  }
}

// printKvWithIndent 让键值对输出能和父级缩进对齐。
function printKvWithIndent(obj: Record<string, unknown>, indent: number): void {
  const pad = " ".repeat(indent);
  const scalarKeys = Object.keys(obj);
  const keyWidth = scalarKeys.reduce(
    (maxWidth, key) => Math.max(maxWidth, key.length),
    0,
  );

  for (const [key, value] of Object.entries(obj)) {
    outputLine(
      `${pad}${key.padEnd(keyWidth)} : ${formatScalarValue(value)}`,
    );
  }
}

// isFlatRecord 判断对象是否可以安全压成单层表格行。
function isFlatRecord(value: Record<string, unknown>): boolean {
  return Object.values(value).every(
    (entryValue) =>
      entryValue === null ||
      entryValue === undefined ||
      typeof entryValue === "string" ||
      typeof entryValue === "number" ||
      typeof entryValue === "boolean" ||
      (Array.isArray(entryValue) &&
        entryValue.every(
          (item) =>
            item === null ||
            item === undefined ||
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean",
        )),
  );
}

// summarizeDescription 把过长说明压缩到更适合终端表格阅读的长度。
export function summarizeDescription(description: string | undefined): string {
  if (!description) {
    return "";
  }

  if (description.length <= 88) {
    return description;
  }

  return `${description.slice(0, 85)}...`;
}
