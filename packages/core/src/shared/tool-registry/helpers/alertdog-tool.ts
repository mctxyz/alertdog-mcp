import { AlertDogClientError } from "../../../api/alertdog.js";
import type { ToolPayload } from "../../tool-types.js";

// normalizeAlertDogToolError 统一归一化 AlertDog 工具错误结构。
export function normalizeAlertDogToolError(
  error: unknown,
  unknownMessage = "未知错误",
): ToolPayload {
  if (error instanceof AlertDogClientError) {
    return {
      ok: false,
      error: {
        type: error.kind,
        message: error.message,
        status: error.status ?? null,
        apiCode: error.apiCode ?? null,
      },
    };
  }

  if (error instanceof Error) {
    return {
      ok: false,
      error: {
        type: "unknown",
        message: error.message,
      },
    };
  }

  return {
    ok: false,
    error: {
      type: "unknown",
      message: unknownMessage,
    },
  };
}

// isAlertDogBusinessMessage 判断错误是否是指定的 AlertDog 业务文案。
export function isAlertDogBusinessMessage(
  error: unknown,
  expectedMessage: string,
): boolean {
  return (
    error instanceof AlertDogClientError &&
    error.kind === "api" &&
    error.message === expectedMessage
  );
}
