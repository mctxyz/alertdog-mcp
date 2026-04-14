import type { AlertDogToolRegistration, AlertDogToolSpec } from "../tool-types.js";

// defineAlertDogToolSpec 统一收敛工具规格形状，便于分类文件保持一致结构。
export function defineAlertDogToolSpec<TClient>(
  toolSpec: AlertDogToolRegistration<TClient>,
): AlertDogToolRegistration<TClient>;
export function defineAlertDogToolSpec(toolSpec: AlertDogToolSpec): AlertDogToolSpec;
export function defineAlertDogToolSpec<TClient>(
  toolSpec: AlertDogToolSpec | AlertDogToolRegistration<TClient>,
): AlertDogToolSpec | AlertDogToolRegistration<TClient> {
  return toolSpec;
}
