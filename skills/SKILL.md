---
name: alertdog
description: "Use this skill whenever the user wants to work with AlertDog through the alertdog CLI or local MCP tools. Start here for apiKey setup, auth checks, and routing into the detailed category skills."
license: MIT
metadata:
  author: alertdog
  version: "1.0.0"
  homepage: "https://alertdog.io"
  agent:
    requires:
      bins: ["alertdog"]
    install:
      - id: npm
        kind: node
        package: "@alertdog/cli"
        bins: ["alertdog"]
        label: "Install AlertDog CLI (npm)"
---

# AlertDog

## Prerequisites

1. Install the AlertDog CLI with `npm install -g @alertdog/cli`.
2. Confirm the `alertdog` command is available in PATH before continuing.
3. Save the user's key once with `alertdog auth set --apikey="$APIKEY"`.
4. Before any authenticated tool call, run `alertdog auth show`.
5. After auth is saved, execute tools with `alertdog run <tool-name>` and do not pass `--apikey`.
6. Never ask the user to paste secrets directly into chat. Ask them to run the command locally instead.

## Credential And API Key Check

- Run `alertdog auth show` before any tool that requires authentication.
- If auth is missing or invalid, stop and guide the user to run `alertdog auth set --apikey="$APIKEY"`.
- After auth is configured, do not pass `--apikey` on tool calls. `alertdog run` loads the saved key automatically.
- If the user is onboarding, validation-only, or rotating a key, read [API Key Skill](./references/apikey-skill.md).
- If a command still returns an auth error after `alertdog auth show`, ask the user to reset the saved key locally and retry.

## Skill Routing

| User intent | Route to skill |
| --- | --- |
| apiKey onboarding, auth check, validate, create, or rotate key | `./references/apikey-skill.md` |
| search CEX assets, inspect official feeds, or manage monitor subscriptions | `./references/cex-monitor-skill.md` |
| list, create, inspect, test, set default, or delete notification channels | `./references/notify-channel-skill.md` |


## Operation Flow

### Step 0 - Check auth state

- If the tool requires apiKey, run `alertdog auth show` first.
- If auth is present, execute the tool with `alertdog run <tool-name>`.
- If the user has not finished setup, route them to [API Key Skill](./references/apikey-skill.md).

### Step 1 - Identify the user's intent

- apiKey onboarding, validation, creation, or rotation -> [API Key Skill](./references/apikey-skill.md)
- notification channel listing, creation, testing, default switch, or deletion -> [Notify Channel Skill](./references/notify-channel-skill.md)
- CEX feed lookup, history query, or monitor subscription management -> [CEX Monitor Skill](./references/cex-monitor-skill.md)

### Step 2 - Load only the category skill you need

- Do not read every reference file by default.
- Open the single category skill that matches the task, then follow its command index and parameter rules.

## Output Mode

- Default mode is human-readable terminal output.
- Add `--json` when the agent needs stable structured output for parsing, chaining, or exact field inspection.
- Prefer default output when the user wants a quick readable answer.
- Prefer `--json` when the next step depends on exact keys such as `page.next`, `id`, `error.message`, or nested result fields.

## Category Index

### [API Key](./references/apikey-skill.md)

- Category id: `apikey`
- Tools: `apikey_usage_guide`, `apikey_get`, `apikey_create`, `apikey_regenerate`
- Scope: Use this category when the task is about onboarding, validating, or rotating AlertDog API keys.

### [CEX Monitor](./references/cex-monitor-skill.md)

- Category id: `cex-monitor`
- Tools: `cex_asset_search`, `cex_price_subscription_create`, `cex_price_subscription_list`, `cex_price_subscription_set_disabled`, `cex_price_subscription_delete`, `cex_offical_candle_signal_feed_list`, `cex_candle_signal_subscription_create`, `cex_candle_signal_subscription_update`, `cex_candle_signal_subscription_list`, `cex_candle_signal_subscription_notify_history_list`, `cex_candle_signal_subscription_set_disabled`, `cex_candle_signal_subscription_delete`
- Scope: Use this category when the task is about inspecting official CEX monitor feeds and signal data.

### [Notify Channel](./references/notify-channel-skill.md)

- Category id: `notify-channel`
- Tools: `notify_channel_list`, `notify_channel_create`, `notify_channel_bound_monitor_count`, `notify_channel_delete`, `notify_channel_set_default`, `notify_channel_send_test`
- Scope: Use this category when the task is about listing, creating, inspecting, testing, or deleting notification channels.

## Shared References

- Category skills live in `references/*-skill.md`
