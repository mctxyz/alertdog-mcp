import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

export interface AlertDogLocalConfig {
  apiKey?: string;
}

// getLocalConfigPath 返回 AlertDog 本地配置文件的绝对路径。
export function getLocalConfigPath(homeDir: string = homedir()): string {
  return resolve(homeDir, ".alertdog-mcp", "config.json");
}

// readLocalConfig 读取并解析本地配置文件，不存在时返回空对象。
export function readLocalConfig(homeDir: string = homedir()): AlertDogLocalConfig {
  const configPath = getLocalConfigPath(homeDir);
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const raw = readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw) as AlertDogLocalConfig;

    return compactConfig({
      apiKey: normalizeOptionalString(parsed.apiKey),
    });
  } catch {
    return {};
  }
}

// saveLocalConfig 把本地配置写入用户目录，并收紧文件权限。
export function saveLocalConfig(
  config: AlertDogLocalConfig,
  homeDir: string = homedir(),
): void {
  const configPath = getLocalConfigPath(homeDir);
  const normalizedConfig = compactConfig(config);

  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify(normalizedConfig, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  chmodSync(configPath, 0o600);
}

// setSavedApiKey 保存用户提供的 apikey，并保留现有的其他本地配置。
export function setSavedApiKey(apiKey: string, homeDir: string = homedir()): void {
  const currentConfig = readLocalConfig(homeDir);

  saveLocalConfig(
    {
      ...currentConfig,
      apiKey: normalizeRequiredString(apiKey, "apiKey"),
    },
    homeDir,
  );
}

// clearSavedApiKey 清除本地保存的 apikey；若配置已空则删除配置文件。
export function clearSavedApiKey(homeDir: string = homedir()): void {
  const configPath = getLocalConfigPath(homeDir);
  const currentConfig = readLocalConfig(homeDir);
  const nextConfig = compactConfig({
    ...currentConfig,
    apiKey: undefined,
  });

  if (Object.keys(nextConfig).length === 0) {
    rmSync(configPath, { force: true });
    return;
  }

  saveLocalConfig(nextConfig, homeDir);
}

// readResolvedApiKey 按显式参数、保存配置、env 的优先级解析 apikey。
export function readResolvedApiKey(
  explicitApiKey?: string,
  env: NodeJS.ProcessEnv = process.env,
  homeDir: string = homedir(),
): string | undefined {
  return (
    normalizeOptionalString(explicitApiKey) ??
    readLocalConfig(homeDir).apiKey ??
    normalizeOptionalString(env.ALERTDOG_API_KEY) ??
    normalizeOptionalString(env.APIKEY)
  );
}

// readSavedApiKeyOnly 只从本地配置文件中读取保存过的 apikey，不读取环境变量。
export function readSavedApiKeyOnly(homeDir: string = homedir()): string | undefined {
  return readLocalConfig(homeDir).apiKey;
}

// maskApiKey 把 apikey 转成适合展示的掩码字符串。
export function maskApiKey(apiKey?: string): string | null {
  const normalizedApiKey = normalizeOptionalString(apiKey);
  if (!normalizedApiKey) {
    return null;
  }

  if (normalizedApiKey.length <= 8) {
    return `${normalizedApiKey.slice(0, 2)}***${normalizedApiKey.slice(-2)}`;
  }

  return `${normalizedApiKey.slice(0, 4)}***${normalizedApiKey.slice(-4)}`;
}

// normalizeOptionalString 清洗可选字符串，空白值统一转成 undefined。
function normalizeOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

// normalizeRequiredString 读取并校验必填字符串。
function normalizeRequiredString(value: string | undefined, fieldName: string): string {
  const normalizedValue = normalizeOptionalString(value);
  if (!normalizedValue) {
    throw new Error(`${fieldName} is required`);
  }

  return normalizedValue;
}

// compactConfig 删除本地配置中的空字段，避免写入无意义键值。
function compactConfig(config: AlertDogLocalConfig): AlertDogLocalConfig {
  return {
    ...(normalizeOptionalString(config.apiKey) ? { apiKey: normalizeOptionalString(config.apiKey) } : {}),
  };
}
