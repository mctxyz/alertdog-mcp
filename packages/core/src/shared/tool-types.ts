export type ToolRiskLevel = "safe" | "caution" | "dangerous";
export type ToolPayload = Record<string, unknown>;
export type ToolExecutor = (args?: Record<string, unknown>) => Promise<ToolPayload>;
export type ToolExecutorMap = Record<string, ToolExecutor>;

export interface ToolConditionalRule {
  when: string;
  requiredFields: string[];
  message: string;
}

export interface ToolExample {
  title: string;
  args?: Record<string, unknown>;
  response?: Record<string, unknown>;
  notes?: string;
}

export interface ToolFieldDescription {
  field: string;
  description: string;
}

export interface ToolResponseFieldDescription {
  field: string;
  description: string;
}

export interface ToolInputJsonSchema {
  type?: string | string[];
  properties?: Record<string, ToolInputJsonSchema>;
  items?: ToolInputJsonSchema | ToolInputJsonSchema[];
  required?: string[];
  enum?: unknown[];
  const?: unknown;
  description?: string;
  title?: string;
  default?: unknown;
  anyOf?: ToolInputJsonSchema[];
  oneOf?: ToolInputJsonSchema[];
  allOf?: ToolInputJsonSchema[];
  additionalProperties?: boolean | ToolInputJsonSchema;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  pattern?: string;
}

export interface AlertDogToolSpec {
  name: string;
  description: string;
  inputSchema: ToolInputJsonSchema;
  requiresApiKey: boolean;
  sideEffect: boolean;
  safeToRetry: boolean;
  riskLevel: ToolRiskLevel;
  category: string;
  recommendedBefore: string[];
  conditionalRules: ToolConditionalRule[];
  examples: ToolExample[];
  fieldDescriptions?: ToolFieldDescription[];
  responseFieldDescriptions?: ToolResponseFieldDescription[];
}

export interface AlertDogToolRegistration<TClient> extends AlertDogToolSpec {
  handler: (
    client: TClient,
    args?: Record<string, unknown>,
  ) => Promise<ToolPayload>;
}
