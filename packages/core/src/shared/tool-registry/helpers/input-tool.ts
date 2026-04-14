// requireNumericString 校验必填数值字符串参数。
export function requireNumericString(value: unknown, fieldName: string): string {
  const normalized = requireString(value, fieldName);
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`${fieldName} must be a numeric string`);
  }
  return normalized;
}

// optionalNumericString 校验可选数值字符串参数，未传时返回 undefined。
export function optionalNumericString(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requireNumericString(value, fieldName);
}

// requireString 从 unknown 值中读取必填字符串参数。
export function requireString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  throw new Error(`${fieldName} is required`);
}

// requireStringArray 校验字符串数组参数。
export function requireStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} must contain at least one value`);
  }
  return value.map((item, index) => requireString(item, `${fieldName}[${index}]`));
}

// requirePositiveOrZeroInt 校验非负整数参数。
export function requirePositiveOrZeroInt(value: unknown, fieldName: string): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10);
  }
  throw new Error(`${fieldName} must be a non-negative integer`);
}

// requirePositiveInt 校验正整数参数。
export function requirePositiveInt(value: unknown, fieldName: string): number {
  const parsed = requirePositiveOrZeroInt(value, fieldName);
  if (parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

// optionalInteger 读取可选整数参数，未传时回退默认值。
export function optionalInteger(value: unknown, fallback: number, fieldName: string): number {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10);
  }
  throw new Error(`${fieldName} must be an integer`);
}

// optionalPositiveInteger 读取可选正整数参数，未传时回退默认值。
export function optionalPositiveInteger(
  value: unknown,
  fallback: number,
  fieldName: string,
): number {
  const parsed = optionalInteger(value, fallback, fieldName);
  if (parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

// optionalPositiveOrZeroInteger 读取可选非负整数参数，未传时回退默认值。
export function optionalPositiveOrZeroInteger(
  value: unknown,
  fallback: number,
  fieldName: string,
): number {
  const parsed = optionalInteger(value, fallback, fieldName);
  if (parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return parsed;
}

// requirePositiveIntArray 校验正整数数组参数。
export function requirePositiveIntArray(value: unknown, fieldName: string): number[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} must contain at least one value`);
  }
  return value.map((item, index) => requirePositiveInt(item, `${fieldName}[${index}]`));
}

// requireZeroOrOne 校验仅允许 0 或 1 的开关参数。
export function requireZeroOrOne(
  value: unknown,
  fallback: number,
  fieldName: string,
): number {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = requirePositiveOrZeroInt(value, fieldName);
  if (parsed !== 0 && parsed !== 1) {
    throw new Error(`${fieldName} must be 0 or 1`);
  }
  return parsed;
}

// requireEnumNumber 校验数字枚举参数，兼容字符串数字输入。
export function requireEnumNumber(
  value: unknown,
  fieldName: string,
  allowedValues: readonly number[],
): number {
  const parsed = requirePositiveOrZeroInt(value, fieldName);
  if (!allowedValues.includes(parsed)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }
  return parsed;
}

// requireEnumString 校验字符串枚举参数。
export function requireEnumString(
  value: unknown,
  fieldName: string,
  allowedValues: readonly string[],
): string {
  const normalized = requireString(value, fieldName);
  if (!allowedValues.includes(normalized)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }
  return normalized;
}

// optionalBoolean 读取可选布尔参数，未传时回退默认值。
export function optionalBoolean(value: unknown, fallback: boolean, fieldName = "value"): boolean {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return requireBoolean(value, fieldName);
}

// requireBoolean 校验布尔参数，兼容 true/false 字符串。
export function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  throw new Error(`${fieldName} must be a boolean`);
}

// normalizeUnknownValue 递归把未知上游结构转成更适合 Agent 消费的 camelCase 数据。
export function normalizeUnknownValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeUnknownValue(item));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      toCamelCase(key),
      normalizeUnknownValue(nestedValue),
    ]);
    return Object.fromEntries(entries);
  }
  return value;
}

// optionalPageFlip 读取历史查询翻页方向。
export function optionalPageFlip(value: unknown): "prev" | "next" {
  if (value === "prev" || value === "next") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "prev" || normalized === "next") {
      return normalized;
    }
  }
  throw new Error("pageFlip must be prev or next");
}

// toCamelCase 把 snake_case 或 kebab-case 字段名转换为 camelCase。
function toCamelCase(value: string): string {
  return value.replace(/[_-]([a-zA-Z0-9])/g, (_, letter: string) => letter.toUpperCase());
}
