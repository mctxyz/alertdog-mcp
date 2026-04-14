import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { registerProxyTools } from "../src/stdio.js";
import { TOOL_NAMES } from "@alertdog/core";
import { setSavedApiKey } from "@alertdog/cli";

interface RecordedTool {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

// createToolRecorder 创建一个最小 stdio server 替身，用来记录注册过的工具。
function createToolRecorder(): {
  tools: RecordedTool[];
  server: {
    tool: (...args: unknown[]) => void;
  };
} {
  const tools: RecordedTool[] = [];

  return {
    tools,
    server: {
      tool: (...args: unknown[]) => {
        const [name, description, maybeSchema] = args;
        tools.push({
          name: String(name),
          description: String(description),
          schema:
            maybeSchema && typeof maybeSchema === "object" && !Array.isArray(maybeSchema)
              ? (maybeSchema as Record<string, unknown>)
              : undefined,
        });
      },
    },
  };
}

test("registerProxyTools registers apikey and notify channel tools", () => {
  const recorder = createToolRecorder();
  const remoteClient = {
    async callTool(): Promise<Record<string, unknown>> {
      return {};
    },
  };

  registerProxyTools(recorder.server, remoteClient);

  assert.deepEqual(
    recorder.tools.map((tool) => tool.name),
    TOOL_NAMES,
  );
});

test("stdio injects apiKey from saved config instead of env", async () => {
  const homeDir = mkdtempSync(join(tmpdir(), "alertdog-stdio-config-"));
  const originalHomeEnv = process.env.HOME;
  const originalUserProfileEnv = process.env.USERPROFILE;

  try {
    setSavedApiKey("saved-config-key", homeDir);
    process.env.HOME = homeDir;
    process.env.USERPROFILE = homeDir;
    process.env.ALERTDOG_API_KEY = "env-key";
    process.env.APIKEY = "legacy-env-key";

    let receivedArgs: Record<string, unknown> | undefined;
    const remoteClient = {
      async callTool(
        name: string,
        args?: Record<string, unknown>,
      ): Promise<Record<string, unknown>> {
        if (name === "apikey_get") {
          receivedArgs = args;
        }
        return {};
      },
    };

    const handlers: Array<(args: Record<string, unknown>) => Promise<Record<string, unknown>>> = [];
    const captureServer = {
      tool: (
        name: string,
        description: string,
        schema: Record<string, unknown>,
        handler: (args: Record<string, unknown>) => Promise<Record<string, unknown>>,
      ): void => {
        if (name === "apikey_get") {
          void description;
          void schema;
          handlers.push(handler);
        }
      },
    };

    registerProxyTools(captureServer, remoteClient);
    assert.equal(handlers.length, 1);

    await handlers[0]({});

    assert.deepEqual(receivedArgs, {
      apiKey: "saved-config-key",
    });
  } finally {
    if (originalHomeEnv === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHomeEnv;
    }
    if (originalUserProfileEnv === undefined) {
      delete process.env.USERPROFILE;
    } else {
      process.env.USERPROFILE = originalUserProfileEnv;
    }
    delete process.env.ALERTDOG_API_KEY;
    delete process.env.APIKEY;
    rmSync(homeDir, { recursive: true, force: true });
  }
});
