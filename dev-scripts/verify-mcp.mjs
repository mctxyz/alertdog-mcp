import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const expectedPackagedFiles = [
  "packages/core/dist/index.js",
  "packages/core/dist/shared/tool-registry.js",
  "packages/cli/dist/bin.js",
  "packages/cli/dist/index.js",
  "packages/mcp/dist/bin-stdio.js",
  "packages/mcp/dist/index.js",
  "packages/mcp/dist/stdio.js",
  "skills/SKILL.md",
  "skills/references/apikey-skill.md",
  "skills/references/cex-monitor-skill.md",
  "skills/references/notify-channel-skill.md",
];

// checkPackagedClient 验证客户端分发目录是否包含关键产物。
function checkPackagedClient() {
  const missingFiles = expectedPackagedFiles.filter(
    (relativePath) => !existsSync(resolve(rootDir, relativePath)),
  );

  if (missingFiles.length > 0) {
    throw new Error(`Missing packaged client files:\n${missingFiles.join("\n")}`);
  }
}

// loadExpectedToolNames 从打包后的 shared registry 读取工具清单，避免在验证脚本里手写重复数据。
async function loadExpectedToolNames() {
  const registryModulePath = resolve(
    rootDir,
    "packages/core/dist/shared/tool-registry.js",
  );
  const registryModuleUrl = pathToFileURL(registryModulePath).href;
  const registryModule = await import(registryModuleUrl);

  return registryModule.TOOL_NAMES;
}

// main 顺序执行本地分发检查和工具清单读取。
async function main() {
  checkPackagedClient();
  await loadExpectedToolNames();
  process.stdout.write("MCP verification passed\n");
}

await main();
