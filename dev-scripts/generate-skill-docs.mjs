import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const registryModulePath = resolve(
  rootDir,
  "packages/core/dist/shared/tool-registry.js",
);
const skillsRootDir = resolve(rootDir, "skills");
const rootSkillPath = resolve(skillsRootDir, "SKILL.md");
const referencesDir = resolve(skillsRootDir, "references");
const legacyCategoriesDir = resolve(skillsRootDir, "categories");

// loadToolSpecs 从编译后的共享 registry 中读取当前工具规格。
async function loadToolSpecs() {
  const registryModuleUrl = pathToFileURL(registryModulePath).href;
  const registryModule = await import(registryModuleUrl);
  return {
    toolSpecs: registryModule.TOOL_SPECS,
    getToolCategoryDefinition: registryModule.getToolCategoryDefinition,
  };
}

// ensureDir 确保目录存在，避免写文件前因为父目录缺失而失败。
function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

// writeIfChanged 仅在内容变化时写入文件，减少无意义改动。
function writeIfChanged(filePath, nextContent) {
  let currentContent = null;

  try {
    currentContent = readFileSync(filePath, "utf8");
  } catch {
    currentContent = null;
  }

  if (currentContent === nextContent) {
    return;
  }

  ensureDir(dirname(filePath));
  writeFileSync(filePath, nextContent);
}

// getCategoryReferenceFileName 统一生成分类 skill 文档文件名。
function getCategoryReferenceFileName(category) {
  return `${category}-skill.md`;
}

// getCategoryReferenceLink 生成根技能里引用 references 文档的相对链接。
function getCategoryReferenceLink(category) {
  return `./references/${getCategoryReferenceFileName(category)}`;
}

// isApiKeyField 判断字段是否为自动注入的 apiKey，文档里不再要求显式传递。
function isApiKeyField(fieldName) {
  return fieldName === "apiKey";
}

// getVisibleSchemaFields 过滤掉本地 auth 自动注入的字段，避免参数表重复暴露 apiKey。
function getVisibleSchemaFields(toolSpec) {
  const inputSchema = normalizeObjectSchema(toolSpec.inputSchema);
  const properties = Object.fromEntries(
    Object.entries(inputSchema.properties ?? {}).filter(([fieldName]) => !isApiKeyField(fieldName)),
  );
  const required = (inputSchema.required ?? []).filter((fieldName) => !isApiKeyField(fieldName));

  return { properties, required };
}

// formatInlineValue 把 schema 默认值或示例值格式化成 Markdown 内联文本。
function formatInlineValue(value) {
  if (value === undefined) {
    return "`-`";
  }

  if (typeof value === "string") {
    return `\`${value}\``;
  }

  return `\`${JSON.stringify(value)}\``;
}

// formatCliArgValue 把示例值格式化成适合 alertdog CLI 的参数值字符串。
function formatCliArgValue(value) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatCliArgValue(item)).join(",");
  }

  return JSON.stringify(value);
}

// isShellSafeValue 判断当前参数值是否可以直接裸传给 shell，而不额外加引号。
function isShellSafeValue(value) {
  return /^[A-Za-z0-9_./,:=@%+-]+$/.test(value);
}

// quoteCliArgValue 仅在 shell 不安全时才给参数值补双引号。
function quoteCliArgValue(value) {
  if (value === "") {
    return '""';
  }

  if (isShellSafeValue(value)) {
    return value;
  }

  return `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

// buildExampleCliCommand 根据工具示例生成 alertdog CLI 命令。
function buildExampleCliCommand(toolSpec, example) {
  const argEntries = Object.entries(example.args ?? {});
  const cliArgs = argEntries.map(
    ([key, value]) => `--${key} ${quoteCliArgValue(formatCliArgValue(value))}`,
  );
  return `alertdog run ${toolSpec.name}${cliArgs.length > 0 ? ` ${cliArgs.join(" ")}` : ""}`;
}

// buildSchemaCliTemplate 根据 inputSchema 的 required/optional 字段生成 CLI 模板。
function buildSchemaCliTemplate(toolSpec) {
  const visibleSchemaFields = getVisibleSchemaFields(toolSpec);
  const properties = visibleSchemaFields.properties ?? {};
  const requiredFields = new Set(visibleSchemaFields.required ?? []);

  const segments = Object.keys(properties).map((fieldName) => {
    const placeholder = `<${fieldName}>`;
    const segment = `--${fieldName} ${placeholder}`;
    return requiredFields.has(fieldName) ? segment : `[${segment}]`;
  });

  return `alertdog run ${toolSpec.name}${segments.length > 0 ? ` ${segments.join(" ")}` : ""}`;
}

// normalizeObjectSchema 归一化对象 schema，便于后续统一读取 properties 和 required。
function normalizeObjectSchema(inputSchema) {
  if (!inputSchema || typeof inputSchema !== "object" || Array.isArray(inputSchema)) {
    return { properties: {}, required: [] };
  }

  const properties =
    inputSchema.properties &&
    typeof inputSchema.properties === "object" &&
    !Array.isArray(inputSchema.properties)
      ? inputSchema.properties
      : {};
  const required = Array.isArray(inputSchema.required) ? inputSchema.required : [];

  return { properties, required };
}

// summarizeSchemaType 生成字段 schema 的紧凑类型摘要。
function summarizeSchemaType(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return "unknown";
  }

  const explicitType = Array.isArray(schema.type)
    ? schema.type.filter((item) => typeof item === "string").join(" | ")
    : typeof schema.type === "string"
      ? schema.type
      : "";

  if (explicitType) {
    if (
      explicitType === "array" &&
      schema.items &&
      typeof schema.items === "object" &&
      !Array.isArray(schema.items)
    ) {
      return `array<${summarizeSchemaType(schema.items)}>`;
    }
    return explicitType;
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return "enum";
  }

  if (schema.const !== undefined) {
    return "const";
  }

  const unionSchemas = Array.isArray(schema.anyOf)
    ? schema.anyOf
    : Array.isArray(schema.oneOf)
      ? schema.oneOf
      : [];
  if (unionSchemas.length > 0) {
    return unionSchemas
      .map((item) => summarizeSchemaType(item))
      .filter((item, index, list) => item && list.indexOf(item) === index)
      .join(" | ");
  }

  return "unknown";
}

// summarizeSchemaRules 把 schema 约束整理成适合表格展示的一行说明。
function summarizeSchemaRules(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return "-";
  }

  const rules = [];

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    rules.push(`allowed: ${schema.enum.map((item) => String(item)).join(", ")}`);
  }

  if (schema.const !== undefined) {
    rules.push(`value: ${String(schema.const)}`);
  }

  const unionSchemas = Array.isArray(schema.anyOf)
    ? schema.anyOf
    : Array.isArray(schema.oneOf)
      ? schema.oneOf
      : [];
  if (unionSchemas.length > 0) {
    const unionRules = unionSchemas
      .map((item) => summarizeSchemaRules(item))
      .filter((item) => item !== "-");
    if (unionRules.length > 0) {
      rules.push(unionRules.join(" ; "));
    }
  }

  if (typeof schema.minimum === "number") {
    rules.push(`min >= ${schema.minimum}`);
  }
  if (typeof schema.exclusiveMinimum === "number") {
    rules.push(`min > ${schema.exclusiveMinimum}`);
  }
  if (typeof schema.maximum === "number") {
    rules.push(`max <= ${schema.maximum}`);
  }
  if (typeof schema.exclusiveMaximum === "number") {
    rules.push(`max < ${schema.exclusiveMaximum}`);
  }
  if (typeof schema.minLength === "number") {
    rules.push(`minLength ${schema.minLength}`);
  }
  if (typeof schema.maxLength === "number") {
    rules.push(`maxLength ${schema.maxLength}`);
  }
  if (typeof schema.minItems === "number") {
    rules.push(`minItems ${schema.minItems}`);
  }
  if (typeof schema.maxItems === "number") {
    rules.push(`maxItems ${schema.maxItems}`);
  }
  if (typeof schema.pattern === "string" && schema.pattern !== "") {
    rules.push(`pattern ${schema.pattern}`);
  }

  return rules.length > 0 ? rules.join("; ") : "-";
}

// getSchemaDefaultValue 提取字段默认值，兼容 anyOf/oneOf 等嵌套 schema。
function getSchemaDefaultValue(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return undefined;
  }

  if (schema.default !== undefined) {
    return schema.default;
  }

  const unionSchemas = Array.isArray(schema.anyOf)
    ? schema.anyOf
    : Array.isArray(schema.oneOf)
      ? schema.oneOf
      : [];
  for (const unionSchema of unionSchemas) {
    const defaultValue = getSchemaDefaultValue(unionSchema);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
  }

  return undefined;
}

// escapeMarkdownTableCell 处理表格单元格里的换行和竖线，避免破坏 Markdown 表格。
function escapeMarkdownTableCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

// buildParameterTable 从 inputSchema 生成参数表，补齐默认值、约束和说明。
function buildParameterTable(toolSpec) {
  const visibleSchemaFields = getVisibleSchemaFields(toolSpec);
  const properties = visibleSchemaFields.properties ?? {};
  const requiredFields = new Set(visibleSchemaFields.required ?? []);
  const rows = Object.entries(properties).map(([fieldName, fieldSchema]) => {
    const description =
      fieldSchema &&
      typeof fieldSchema === "object" &&
      !Array.isArray(fieldSchema) &&
      typeof fieldSchema.description === "string"
        ? fieldSchema.description
        : "-";

    return `| \`${escapeMarkdownTableCell(fieldName)}\` | ${requiredFields.has(fieldName) ? "Yes" : "No"} | \`${escapeMarkdownTableCell(summarizeSchemaType(fieldSchema))}\` | ${escapeMarkdownTableCell(formatInlineValue(getSchemaDefaultValue(fieldSchema)))} | ${escapeMarkdownTableCell(summarizeSchemaRules(fieldSchema))} | ${escapeMarkdownTableCell(description)} |`;
  });

  if (rows.length === 0) {
    return [
      toolSpec.requiresApiKey
        ? "This tool does not require explicit runtime parameters. Authentication is loaded from saved local `alertdog auth` config."
        : "This tool does not accept structured input parameters.",
      "",
    ].join("\n");
  }

  return [
    ...(toolSpec.requiresApiKey
      ? [
          "> `apiKey` is omitted from this table because `alertdog run` injects it from saved local auth.",
          "",
        ]
      : []),
    "| Parameter | Required | Type | Default | Rules | Description |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}

// formatExampleResponse 渲染 JSON 示例响应代码块。
function formatExampleResponse(value) {
  return `\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

// getCategoryTitle 返回分类标题，未知分类时回退到分类 id。
function getCategoryTitle(categoryDefinition, category) {
  return categoryDefinition?.title ?? category;
}

// getCategoryIntro 返回分类说明，未知分类时回退到默认说明。
function getCategoryIntro(categoryDefinition) {
  return categoryDefinition?.intro ?? "Use this category when the task clearly matches these tools.";
}

// renderConditionalRules 把条件参数规则渲染成更适合 agent 阅读的列表。
function renderConditionalRules(toolSpec) {
  if (toolSpec.conditionalRules.length === 0) {
    return "- None.";
  }

  return toolSpec.conditionalRules
    .map((rule) => `- When \`${rule.when}\`: ${rule.message}`)
    .join("\n");
}

// renderExamples 渲染工具示例，包括示例参数和 alertdog CLI 命令。
function renderExamples(toolSpec) {
  if (toolSpec.examples.length === 0) {
    return [
      "### Example",
      "",
      `- CLI template: \`${buildSchemaCliTemplate(toolSpec)}\``,
      "",
    ].join("\n");
  }

  return toolSpec.examples
    .map((example, index) => {
      const lines = [`### Example ${index + 1}: ${example.title}`, ""];
      lines.push(`- CLI template: \`${buildSchemaCliTemplate(toolSpec)}\``);
      if (example.args && Object.keys(example.args).length > 0) {
        const visibleExampleArgs = Object.fromEntries(
          Object.entries(example.args).filter(([fieldName]) => !isApiKeyField(fieldName)),
        );
        lines.push(
          `- Example CLI: \`${buildExampleCliCommand(toolSpec, { ...example, args: visibleExampleArgs })}\``,
        );
      }
      if (example.notes) {
        lines.push(`- Notes: ${example.notes}`);
      }
      if (example.response && Object.keys(example.response).length > 0) {
        lines.push(`- Example response:${formatExampleResponse(example.response)}`);
      }
      lines.push("");
      return lines.join("\n");
    })
    .join("");
}

// renderFieldGuidance 渲染额外字段说明，补充 inputSchema 之外的业务语义。
function renderFieldGuidance(title, items) {
  if (!items || items.length === 0) {
    return "";
  }

  return [
    `## ${title}`,
    "",
    ...items.map((item) => `- \`${item.field}\`: ${item.description}`),
    "",
  ].join("\n");
}

// renderToolSection 根据共享工具规格渲染单个工具文档段落。
function renderToolSection(toolSpec) {
  const lines = [
    `## \`${toolSpec.name}\``,
    "",
    toolSpec.description,
    "",
    "### Command Summary",
    "",
    `- Command: \`alertdog run ${toolSpec.name}\``,
    `- Category: \`${toolSpec.category}\``,
    `- Auth: ${toolSpec.requiresApiKey ? "Uses saved local apiKey from \`alertdog auth\`" : "No apiKey required"}`,
    `- Type: ${toolSpec.sideEffect ? "WRITE" : "READ"}`,
    `- Risk: \`${toolSpec.riskLevel}\``,
    `- Safe to retry: ${toolSpec.safeToRetry ? "yes" : "no"}`,
  ];

  if (toolSpec.recommendedBefore.length > 0) {
    lines.push(
      `- Recommended before: ${toolSpec.recommendedBefore.map((name) => `\`${name}\``).join(", ")}`,
    );
  }

  lines.push("");
  lines.push("### Parameters");
  lines.push("");
  lines.push(buildParameterTable(toolSpec));
  lines.push("### Conditional Rules");
  lines.push("");
  lines.push(renderConditionalRules(toolSpec));
  lines.push("");

  const fieldGuidance = renderFieldGuidance(
    "Field Guidance",
    toolSpec.fieldDescriptions ?? [],
  );
  if (fieldGuidance) {
    lines.push(fieldGuidance);
  }

  const responseGuidance = renderFieldGuidance(
    "Response Field Guidance",
    toolSpec.responseFieldDescriptions ?? [],
  );
  if (responseGuidance) {
    lines.push(responseGuidance);
  }

  lines.push(renderExamples(toolSpec));
  return lines.join("\n");
}

// groupToolSpecsByCategory 按共享 category 字段对工具规格分组。
function groupToolSpecsByCategory(toolSpecs) {
  return toolSpecs.reduce((groups, toolSpec) => {
    const categoryToolSpecs = groups.get(toolSpec.category) ?? [];
    categoryToolSpecs.push(toolSpec);
    groups.set(toolSpec.category, categoryToolSpecs);
    return groups;
  }, new Map());
}

// renderCategorySummary 为根技能索引渲染单个分类摘要。
function renderCategorySummary(category, toolSpecs, getToolCategoryDefinition) {
  const categoryDefinition = getToolCategoryDefinition(category);
  const fileName = getCategoryReferenceFileName(category);
  return [
    `### [${getCategoryTitle(categoryDefinition, category)}](./references/${fileName})`,
    "",
    `- Category id: \`${category}\``,
    `- Tools: ${toolSpecs.map((toolSpec) => `\`${toolSpec.name}\``).join(", ")}`,
    `- Scope: ${getCategoryIntro(categoryDefinition)}`,
    "",
  ].join("\n");
}

// buildSkillRoutingTable 生成根技能的意图路由表，指导 agent 跳转到对应 skill。
function buildSkillRoutingTable(groupedToolSpecs, getToolCategoryDefinition) {
  const intentByCategory = {
    apikey: "apiKey onboarding, auth check, validate, create, or rotate key",
    "notify-channel":
      "list, create, inspect, test, set default, or delete notification channels",
    "cex-monitor":
      "search CEX assets, inspect official feeds, or manage monitor subscriptions",
  };
  const lines = [
    "| User intent | Route to skill |",
    "| --- | --- |",
  ];

  const orderedCategories = [...groupedToolSpecs.keys()].sort((left, right) =>
    left.localeCompare(right),
  );

  for (const category of orderedCategories) {
    const categoryDefinition = getToolCategoryDefinition(category);
    lines.push(
      `| ${intentByCategory[category] ?? getCategoryIntro(categoryDefinition)} | \`${getCategoryReferenceLink(category)}\` |`,
    );
  }

  return `${lines.join("\n")}\n`;
}

// buildRootSkillDoc 构建根技能索引，并指向 references 下的分类 skill 文档。
function buildRootSkillDoc(groupedToolSpecs, getToolCategoryDefinition) {
  const categorySections = [...groupedToolSpecs.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, toolSpecs]) =>
      renderCategorySummary(category, toolSpecs, getToolCategoryDefinition),
    )
    .join("\n");

  return `---
name: alertdog
description: Use this skill whenever the user wants to work with AlertDog through the alertdog CLI or local MCP tools. Start here for apiKey setup, auth checks, and routing into the detailed category skills.
---

# AlertDog

## Prerequisites

1. Install the AlertDog CLI with \`npm install -g @alertdog/cli\`.
2. Confirm the \`alertdog\` command is available in PATH before continuing.
3. Save the user's key once with \`alertdog auth set --apikey="$APIKEY"\`.
4. Before any authenticated tool call, run \`alertdog auth show\`.
5. After auth is saved, execute tools with \`alertdog run <tool-name>\` and do not pass \`--apikey\`.
6. Never ask the user to paste secrets directly into chat. Ask them to run the command locally instead.

## Credential And API Key Check

- Run \`alertdog auth show\` before any tool that requires authentication.
- If auth is missing or invalid, stop and guide the user to run \`alertdog auth set --apikey="$APIKEY"\`.
- After auth is configured, do not pass \`--apikey\` on tool calls. \`alertdog run\` loads the saved key automatically.
- If the user is onboarding, validation-only, or rotating a key, read [API Key Skill](${getCategoryReferenceLink("apikey")}).
- If a command still returns an auth error after \`alertdog auth show\`, ask the user to reset the saved key locally and retry.

## Skill Routing

${buildSkillRoutingTable(groupedToolSpecs, getToolCategoryDefinition)}

## Operation Flow

### Step 0 - Check auth state

- If the tool requires apiKey, run \`alertdog auth show\` first.
- If auth is present, execute the tool with \`alertdog run <tool-name>\`.
- If the user has not finished setup, route them to [API Key Skill](${getCategoryReferenceLink("apikey")}).

### Step 1 - Identify the user's intent

- apiKey onboarding, validation, creation, or rotation -> [API Key Skill](${getCategoryReferenceLink("apikey")})
- notification channel listing, creation, testing, default switch, or deletion -> [Notify Channel Skill](${getCategoryReferenceLink("notify-channel")})
- CEX feed lookup, history query, or monitor subscription management -> [CEX Monitor Skill](${getCategoryReferenceLink("cex-monitor")})

### Step 2 - Load only the category skill you need

- Do not read every reference file by default.
- Open the single category skill that matches the task, then follow its command index and parameter rules.

## Category Index

${categorySections}
## Shared References

- Category skills live in \`references/*-skill.md\`
`;
}

// buildCategoryCommandIndex 为分类 skill 生成命令索引表。
function buildCategoryCommandIndex(toolSpecs) {
  const lines = [
    "| Command | Type | Auth | Risk | Description |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const toolSpec of toolSpecs) {
    lines.push(
      `| \`alertdog run ${toolSpec.name}\` | ${toolSpec.sideEffect ? "WRITE" : "READ"} | ${toolSpec.requiresApiKey ? "Saved auth" : "Public"} | \`${toolSpec.riskLevel}\` | ${toolSpec.description} |`,
    );
  }

  return `${lines.join("\n")}\n`;
}

// buildCategorySkillDoc 为每个分类构建一个 references 下的生成技能文件。
function buildCategorySkillDoc(category, toolSpecs, getToolCategoryDefinition) {
  const categoryDefinition = getToolCategoryDefinition(category);
  const title = getCategoryTitle(categoryDefinition, category);
  const intro = getCategoryIntro(categoryDefinition);
  const detailSections = toolSpecs.map(renderToolSection).join("\n");

  return `---
name: alertdog-${category}
description: ${intro}
---

# AlertDog ${title}

## When To Use This Skill

${intro}

## Before You Start

- If the command needs authentication, run \`alertdog auth show\` first.
- If auth is missing, guide the user to run \`alertdog auth set --apikey="$APIKEY"\`.
- After auth is saved, use \`alertdog run <tool-name>\` and do not pass \`--apikey\`.
- Never ask the user to paste secrets into chat.
- Prefer loading only this file plus the root \`SKILL.md\` unless the user explicitly needs a broader catalog.

## Command Index

${buildCategoryCommandIndex(toolSpecs)}

## How To Work With This Skill

1. Match the user intent to one command in the index.
2. Read the parameter table for that command.
3. Respect required fields, default values, enum ranges, and conditional rules from \`inputSchema\`.
4. For WRITE commands, make sure the user explicitly asked for the state-changing action before executing.

${detailSections}`;
}

// writeCategorySkillDocs 把分类 skill 文档写入 references 目录，并清理旧 categories 目录。
function writeCategorySkillDocs(groupedToolSpecs, getToolCategoryDefinition) {
  rmSync(legacyCategoriesDir, { recursive: true, force: true });

  for (const [category, toolSpecs] of groupedToolSpecs.entries()) {
    writeIfChanged(
      resolve(referencesDir, getCategoryReferenceFileName(category)),
      buildCategorySkillDoc(category, toolSpecs, getToolCategoryDefinition),
    );
  }
}

// main 基于打包后的 registry 生成根 skill 与 references 下的分类 skill 文档。
async function main() {
  const { toolSpecs, getToolCategoryDefinition } = await loadToolSpecs();
  const groupedToolSpecs = groupToolSpecsByCategory(toolSpecs);

  ensureDir(referencesDir);
  rmSync(resolve(referencesDir, "tool-usage.md"), { force: true });
  writeIfChanged(
    rootSkillPath,
    buildRootSkillDoc(groupedToolSpecs, getToolCategoryDefinition),
  );
  writeCategorySkillDocs(groupedToolSpecs, getToolCategoryDefinition);
}

await main();
