export const SERVER_VERSION = "1.0.1";
export const CLI_VERSION = "1.0.1";
export const CONTRACT_VERSION = "1.0.1";
export const SKILL_VERSION = "1.0.1";
export const STDIO_VERSION = "1.0.1";

// formatRuntimeVersionLine 按统一格式拼接运行时版本日志。
export function formatRuntimeVersionLine(
  runtimeName: string,
  runtimeVersion: string,
): string {
  return `[AlertDog] ${runtimeName} version=${runtimeVersion}`;
}

// printRuntimeVersion 把当前运行时版本打印到标准错误，避免污染正常输出。
export function printRuntimeVersion(
  runtimeName: string,
  runtimeVersion: string,
): void {
  process.stderr.write(`${formatRuntimeVersionLine(runtimeName, runtimeVersion)}\n`);
}
