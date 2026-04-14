import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();
const scopeDir = resolve(rootDir, "node_modules", "@alertdog");

const WORKSPACE_PACKAGES = [
  "core",
  "cli",
  "mcp",
  "examples",
  "skills",
];

// ensureDir 确保目录存在，供 workspace 链接写入使用。
function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

// recreateSymlink 重新创建包级符号链接，避免旧链接或旧目录残留。
function recreateSymlink(linkPath, targetPath) {
  rmSync(linkPath, { recursive: true, force: true });
  symlinkSync(targetPath, linkPath, "junction");
}

// refreshScopeDir 在指定 node_modules 作用域目录下重建所有 workspace 包链接。
function refreshScopeDir(targetScopeDir) {
  ensureDir(targetScopeDir);

  for (const packageName of WORKSPACE_PACKAGES) {
    const packageDir = resolve(rootDir, "packages", packageName);
    if (!existsSync(packageDir)) {
      continue;
    }

    recreateSymlink(resolve(targetScopeDir, packageName), packageDir);
  }
}

// main 为 @alertdog 下的各个 workspace 包创建本地 node_modules 链接。
function main() {
  refreshScopeDir(scopeDir);

  for (const packageName of WORKSPACE_PACKAGES) {
    const packageNodeModulesScopeDir = resolve(
      rootDir,
      "packages",
      packageName,
      "node_modules",
      "@alertdog",
    );
    refreshScopeDir(packageNodeModulesScopeDir);
  }

  process.stdout.write("Workspace package links refreshed\n");
}

main();
