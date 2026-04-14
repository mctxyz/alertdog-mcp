import { AlertDogClientError } from "../../../api/alertdog.js";
import type { ToolPayload } from "../../tool-types.js";

// summarizeUnknownCause 递归提取底层 cause 的可读错误原因，避免只停在 fetch failed 这一层。
function summarizeUnknownCause(cause: unknown): string | null {
  if (!cause) {
    return null;
  }

  if (cause instanceof Error) {
    const nestedCause = summarizeUnknownCause(
      (cause as Error & { cause?: unknown }).cause,
    );
    if (nestedCause && nestedCause !== cause.message) {
      return nestedCause;
    }

    return cause.message || cause.name || null;
  }

  if (typeof cause === "string") {
    return cause;
  }

  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
}

// summarizeErrorCause 提取底层 cause 的可读错误原因，避免网络错误只显示统一文案。
function summarizeErrorCause(error: Error): string | null {
  return summarizeUnknownCause((error as Error & { cause?: unknown }).cause);
}

// normalizeAlertDogToolError 统一归一化 AlertDog 工具错误结构。
export function normalizeAlertDogToolError(
  error: unknown,
  unknownMessage = "未知错误",
): ToolPayload {
  if (error instanceof AlertDogClientError) {
    const causeMessage =
      error.kind === "network" ? summarizeErrorCause(error) : null;
    return {
      ok: false,
      error: {
        type: error.kind,
        message:
          causeMessage && causeMessage !== error.message
            ? `${error.message}: ${causeMessage}`
            : error.message,
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
