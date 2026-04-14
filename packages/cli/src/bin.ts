#!/usr/bin/env node

import { main } from "./index.js";

// runCli 作为 alertdog 可执行入口直接启动 CLI 主流程。
void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
