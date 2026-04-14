#!/usr/bin/env node

import { main } from "./stdio.js";

// runStdio 作为 alertdog-mcp 可执行入口直接启动 stdio 常驻进程。
void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
