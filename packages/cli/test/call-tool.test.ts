import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildRunToolCommandContext,
  mergeApiKeyIntoArgs,
  parseArgs,
} from "../src/index.js";
import {
  setSavedApiKey,
} from "../src/local-config.js";

test("parseArgs supports auth set with --apikey", () => {
  const result = parseArgs(["auth", "set", "--apikey=test-key"], {}, tmpdir());

  assert.deepEqual(result, {
    command: "auth",
    action: "set",
    apiKey: "test-key",
    json: false,
  });
});

test("parseArgs injects saved apiKey into call command", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "alertdog-config-"));

  try {
    setSavedApiKey("saved-key", homeDir);

    const result = parseArgs(
      ["call", "apikey_get"],
      {},
      homeDir,
    );

    assert.deepEqual(result, {
      command: "run",
      toolName: "apikey_get",
      json: false,
      toolArgs: {
        apiKey: "saved-key",
      },
    });
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("mergeApiKeyIntoArgs keeps arguments unchanged when apiKey is absent", () => {
  const result = mergeApiKeyIntoArgs(
    {
      id: 1,
    },
    undefined,
  );

  assert.deepEqual(result, {
    id: 1,
  });
});

test("parseArgs maps run command to run tool execution shape", () => {
  const result = parseArgs(["run", "notify_channel_list"], {}, tmpdir());

  assert.deepEqual(result, {
    command: "run",
    toolName: "notify_channel_list",
    json: false,
    toolArgs: {},
  });
});

test("parseArgs supports run command with flag-style tool arguments", () => {
  const result = parseArgs(
    [
      "run",
      "cex_candle_signal_subscription_create",
      "--interval",
      "5m",
      "--direction",
      "1",
      "--desc",
      "false",
      "--exchanges",
      "binance,okex",
      "--channels",
      "3595,3596",
    ],
    {},
    tmpdir(),
  );

  assert.deepEqual(result, {
    command: "run",
    toolName: "cex_candle_signal_subscription_create",
    json: false,
    toolArgs: {
      interval: "5m",
      direction: "1",
      desc: false,
      exchanges: ["binance", "okex"],
      channels: ["3595", "3596"],
    },
  });
});

test("parseArgs prefers saved apiKey when run command does not pass one", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "alertdog-config-"));

  try {
    setSavedApiKey("saved-key", homeDir);

    const result = parseArgs(
      ["run", "cex_candle_signal_subscription_list", "--limit", "20"],
      {},
      homeDir,
    );

    assert.deepEqual(result, {
      command: "run",
      toolName: "cex_candle_signal_subscription_list",
      json: false,
      toolArgs: {
        limit: "20",
        apiKey: "saved-key",
      },
    });
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("parseArgs supports future settle time diff arbitrage tool flags", () => {
  const result = parseArgs(
    [
      "run",
      "cex_future_settle_time_diff_arbitrage_list",
      "--page",
      "2",
      "--quote",
      "USDT",
      "--assetId",
      "12",
    ],
    {},
    tmpdir(),
  );

  assert.deepEqual(result, {
    command: "run",
    toolName: "cex_future_settle_time_diff_arbitrage_list",
    json: false,
    toolArgs: {
      page: "2",
      quote: "USDT",
      assetId: "12",
    },
  });
});

test("parseArgs supports settle diff index and limit pagination flags", () => {
  const parsedArgs = parseArgs(
    [
      "run",
      "cex_future_settle_time_diff_arbitrage_list",
      "--index",
      "3",
      "--limit",
      "25",
      "--quote",
      "USDT",
    ],
    {},
    tmpdir(),
  );

  assert.deepEqual(parsedArgs, {
    command: "run",
    toolName: "cex_future_settle_time_diff_arbitrage_list",
    json: false,
    toolArgs: {
      index: "3",
      limit: "25",
      quote: "USDT",
    },
  });
});

test("parseArgs keeps JSON array string flags unchanged for webhook payloads", () => {
  const result = parseArgs(
    [
      "run",
      "notify_channel_create",
      "--channelType",
      "dingtalk",
      "--webhookUrl",
      '[{"webhook":"https://example.com/hook","key":"secret"}]',
    ],
    {},
    tmpdir(),
  );

  assert.deepEqual(result, {
    command: "run",
    toolName: "notify_channel_create",
    json: false,
    toolArgs: {
      channelType: "dingtalk",
      webhookUrl: '[{"webhook":"https://example.com/hook","key":"secret"}]',
    },
  });
});

test("buildRunToolCommandContext returns tool execution context", () => {
  const context = buildRunToolCommandContext({
    command: "run",
    toolName: "apikey_usage_guide",
    toolArgs: {},
  });

  assert.deepEqual(context, {
    toolName: "apikey_usage_guide",
    toolArgs: {},
  });
});

test("parseArgs supports --json for run command", () => {
  const result = parseArgs(
    ["run", "apikey_get", "--json"],
    {},
    tmpdir(),
  );

  assert.deepEqual(result, {
    command: "run",
    toolName: "apikey_get",
    json: true,
    toolArgs: {},
  });
});
