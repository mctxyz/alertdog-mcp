import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  clearSavedApiKey,
  getLocalConfigPath,
  readLocalConfig,
  readResolvedApiKey,
  saveLocalConfig,
  setSavedApiKey,
} from "../src/local-config.js";

test("readResolvedApiKey prefers explicit value then saved config then env", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "alertdog-config-"));
  const emptyHomeDir = mkdtempSync(join(tmpdir(), "alertdog-config-empty-"));

  try {
    saveLocalConfig(
      {
        apiKey: "saved-key",
      },
      homeDir,
    );

    assert.equal(
      readResolvedApiKey(
        "explicit-key",
        {
          ALERTDOG_API_KEY: "env-key",
          APIKEY: "legacy-env-key",
        },
        homeDir,
      ),
      "explicit-key",
    );

    assert.equal(
      readResolvedApiKey(
        undefined,
        {
          ALERTDOG_API_KEY: "env-key",
          APIKEY: "legacy-env-key",
        },
        homeDir,
      ),
      "saved-key",
    );

    assert.equal(readResolvedApiKey(undefined, {}, homeDir), "saved-key");
    assert.equal(
      readResolvedApiKey(
        undefined,
        {
          ALERTDOG_API_KEY: "env-key",
          APIKEY: "legacy-env-key",
        },
        emptyHomeDir,
      ),
      "env-key",
    );
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
    rmSync(emptyHomeDir, { recursive: true, force: true });
  }
});

test("setSavedApiKey writes config file and clearSavedApiKey removes apiKey", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "alertdog-config-"));

  try {
    setSavedApiKey("new-key", homeDir);

    assert.deepEqual(readLocalConfig(homeDir), {
      apiKey: "new-key",
    });

    clearSavedApiKey(homeDir);

    assert.deepEqual(readLocalConfig(homeDir), {});
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("saveLocalConfig stores file under user home config path", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "alertdog-config-"));

  try {
    saveLocalConfig(
      {
        apiKey: "saved-key",
      },
      homeDir,
    );

    assert.equal(
      getLocalConfigPath(homeDir),
      join(homeDir, ".alertdog-mcp", "config.json"),
    );
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});
