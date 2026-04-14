import { CLI_VERSION, SKILL_VERSION, STDIO_VERSION } from "./version.js";

export const CLIENT_TYPE_HEADER = "x-alertdog-client-type";
export const CLIENT_NAME_HEADER = "x-alertdog-client-name";
export const CLIENT_VERSION_HEADER = "x-alertdog-client-version";
export const SOURCE_HEADER = "x-alertdog-source";

export type AlertDogClientType = "agent" | "skill" | "stdio";

export interface AlertDogClientVersionInfo {
  clientType: AlertDogClientType;
  clientName: string;
  clientVersion: string;
}

// buildVersionHeaders 把客户端版本信息转换成统一的请求头集合。
export function buildVersionHeaders(
  clientInfo: AlertDogClientVersionInfo,
): Record<string, string> {
  return {
    [SOURCE_HEADER]: clientInfo.clientType,
    [CLIENT_TYPE_HEADER]: clientInfo.clientType,
    [CLIENT_NAME_HEADER]: clientInfo.clientName,
    [CLIENT_VERSION_HEADER]: clientInfo.clientVersion,
  };
}

// getAgentClientVersionInfo 返回本地 agent 调用 REST API 时要上报的版本信息。
export function getAgentClientVersionInfo(): AlertDogClientVersionInfo {
  return {
    clientType: "agent",
    clientName: "alertdog-agent",
    clientVersion: CLI_VERSION,
  };
}

// getSkillClientVersionInfo 返回 skills one-shot 脚本要上报的版本信息。
export function getSkillClientVersionInfo(): AlertDogClientVersionInfo {
  return {
    clientType: "skill",
    clientName: "alertdog-skill",
    clientVersion: SKILL_VERSION,
  };
}

// getStdioClientVersionInfo 返回 stdio 代理要上报的版本信息。
export function getStdioClientVersionInfo(): AlertDogClientVersionInfo {
  return {
    clientType: "stdio",
    clientName: "alertdog-stdio",
    clientVersion: STDIO_VERSION,
  };
}
