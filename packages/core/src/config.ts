export interface AlertDogCoreConfig {
  alertDogBaseUrl: string;
  mctBackendBaseUrl: string;
  timeoutMs: number;
  debugHttp: boolean;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_ALERTDOG_BASE_URL = "https://api.mct.club/alertdog";
const DEFAULT_MCT_BACKEND_BASE_URL = "https://api.mct.club/api";

// readStringEnv 读取并清洗字符串环境变量。
function readStringEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) {
    return undefined;
  }
  return value;
}

// readPositiveIntEnv 读取正整数环境变量，不合法时回退默认值。
function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = readStringEnv(name);
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

// readBooleanEnv 读取布尔环境变量，支持 true/false/1/0/on/off。
function readBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = readStringEnv(name);
  if (!raw) {
    return fallback;
  }

  const normalized = raw.toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "on") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "off") {
    return false;
  }

  return fallback;
}

// normalizeBaseUrl 统一清洗根地址，避免尾部斜杠重复。
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

// loadCoreConfig 加载本地直连 AlertDog API 所需配置。
export function loadCoreConfig(): AlertDogCoreConfig {
  return {
    alertDogBaseUrl: normalizeBaseUrl(
      readStringEnv("ALERTDOG_BASE_URL") ?? DEFAULT_ALERTDOG_BASE_URL,
    ),
    mctBackendBaseUrl: normalizeBaseUrl(
      readStringEnv("ALERTDOG_MCT_BACKEND_BASE_URL") ?? DEFAULT_MCT_BACKEND_BASE_URL,
    ),
    timeoutMs: readPositiveIntEnv("ALERTDOG_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
    debugHttp: readBooleanEnv("ALERTDOG_DEBUG_HTTP", false),
  };
}
