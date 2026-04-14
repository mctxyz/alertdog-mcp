export interface ToolCategoryDefinition {
  id: string;
  title: string;
  intro: string;
}

export const TOOL_CATEGORY_DEFINITIONS: ToolCategoryDefinition[] = [
  {
    id: "apikey",
    title: "API Key",
    intro:
      "Use this category when the task is about onboarding, validating, or rotating AlertDog API keys.",
  },
  {
    id: "notify-channel",
    title: "Notify Channel",
    intro:
      "Use this category when the task is about listing, creating, inspecting, testing, or deleting notification channels.",
  },
  {
    id: "cex-monitor",
    title: "CEX Monitor",
    intro:
      "Use this category when the task is about inspecting official CEX monitor feeds and signal data.",
  },
];

export const TOOL_CATEGORY_DEFINITIONS_BY_ID = new Map(
  TOOL_CATEGORY_DEFINITIONS.map((definition) => [definition.id, definition] as const),
);

// getToolCategoryDefinition 返回指定分类的共享定义，供文档生成和其他入口复用。
export function getToolCategoryDefinition(categoryId: string): ToolCategoryDefinition | null {
  return TOOL_CATEGORY_DEFINITIONS_BY_ID.get(categoryId) ?? null;
}
