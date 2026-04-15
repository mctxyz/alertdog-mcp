---
name: alertdog-notify-channel
description: "Use this category when the task is about listing, creating, inspecting, testing, or deleting notification channels."
---

# AlertDog Notify Channel

## When To Use This Skill

Use this category when the task is about listing, creating, inspecting, testing, or deleting notification channels.

## Before You Start

- If the command needs authentication, run `alertdog auth show` first.
- If auth is missing, guide the user to run `alertdog auth set --apikey="$APIKEY"`.
- After auth is saved, use `alertdog run <tool-name>` and do not pass `--apikey`.
- Never ask the user to paste secrets into chat.
- Prefer loading only this file plus the root `SKILL.md` unless the user explicitly needs a broader catalog.

## Command Index

| Command | Type | Auth | Risk | Description |
| --- | --- | --- | --- | --- |
| `alertdog run notify_channel_list` | READ | Saved auth | `safe` | Use this tool when the user wants to list the notification channels available in the current AlertDog account. This is a read-only operation and does not modify any notification channel. |
| `alertdog run notify_channel_create` | WRITE | Saved auth | `caution` | Use this tool only when the user explicitly wants to create a new notification channel in the current AlertDog account. This is a write operation with side effects. Depending on channelType, it can create Telegram, Discord, DingTalk, Feishu, WeCom, Webhook, or Bark channels. For DingTalk and Feishu, secretKey is required and webhookUrl must be a JSON array string such as [{"webhook":"https://...","key":"secret"}]. |
| `alertdog run notify_channel_bound_monitor_count` | READ | Saved auth | `safe` | Use this tool when the user wants to inspect how many monitors are currently bound to a notification channel. This is a read-only operation and does not modify any notification channel or monitor configuration. |
| `alertdog run notify_channel_delete` | WRITE | Saved auth | `dangerous` | Use this tool only when the user explicitly wants to delete a notification channel. This is a write operation with side effects and will delete the specified channel. |
| `alertdog run notify_channel_set_default` | WRITE | Saved auth | `caution` | Use this tool only when the user explicitly wants to set a notification channel as the default channel. This is a write operation with side effects and will modify the default notification configuration. |
| `alertdog run notify_channel_send_test` | WRITE | Saved auth | `caution` | Use this tool when the user wants to send a test message through a notification channel to verify connectivity. This is a write operation with side effects and sends one test notification. |


## How To Work With This Skill

1. Match the user intent to one command in the index.
2. Read the parameter table for that command.
3. Respect required fields, default values, enum ranges, and conditional rules from `inputSchema`.
4. For WRITE commands, make sure the user explicitly asked for the state-changing action before executing.

## Output Mode

- Default output is optimized for direct reading in the terminal.
- Add `--json` when the agent needs machine-friendly output for parsing or follow-up automation.
- Use `--json` for workflows that depend on exact pagination cursors, ids, booleans, or nested response objects.

## `notify_channel_list`

Use this tool when the user wants to list the notification channels available in the current AlertDog account. This is a read-only operation and does not modify any notification channel.

### Command Summary

- Command: `alertdog run notify_channel_list`
- Category: `notify-channel`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: READ
- Risk: `safe`
- Safe to retry: yes

### Parameters

This tool does not require explicit runtime parameters. Authentication is loaded from saved local `alertdog auth` config.

### Conditional Rules

- None.

### Example 1: List notification channels in the current account

- CLI template: `alertdog run notify_channel_list`
- Example CLI: `alertdog run notify_channel_list`

## `notify_channel_create`

Use this tool only when the user explicitly wants to create a new notification channel in the current AlertDog account. This is a write operation with side effects. Depending on channelType, it can create Telegram, Discord, DingTalk, Feishu, WeCom, Webhook, or Bark channels. For DingTalk and Feishu, secretKey is required and webhookUrl must be a JSON array string such as [{"webhook":"https://...","key":"secret"}].

### Command Summary

- Command: `alertdog run notify_channel_create`
- Category: `notify-channel`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: WRITE
- Risk: `caution`
- Safe to retry: no
- Recommended before: `notify_channel_list`

### Parameters

> `apiKey` is omitted from this table because `alertdog run` injects it from saved local auth.

| Parameter | Required | Type | Default | Rules | Description |
| --- | --- | --- | --- | --- | --- |
| `channelType` | Yes | `string` | `-` | allowed: telegram, discord, dingtalk, feishu, wecom, webhook, bark | Notification channel type. Supported values: telegram, discord, dingtalk, feishu, wecom, webhook, bark. |
| `name` | Yes | `string` | `-` | minLength 1 | Notification channel display name. |
| `chatId` | No | `string` | `-` | - | chat_id required by Telegram channels. |
| `webhookUrl` | No | `string` | `-` | - | webhook_url required by Discord, WeCom, Webhook, and Bark channels. DingTalk and Feishu require a JSON array string such as [{"webhook":"https://...","key":"secret"}]. |
| `secretKey` | No | `string` | `-` | - | Signing secret required by DingTalk and Feishu channels. It must still be provided explicitly even if webhookUrl already contains key values inside the JSON array string. |

### Conditional Rules

- When `channelType=telegram`: Telegram channels require chatId.
- When `channelType in [discord,wecom,webhook,bark]`: Discord, WeCom, Webhook, and Bark channels require webhookUrl.
- When `channelType in [dingtalk,feishu]`: DingTalk and Feishu channels require both webhookUrl and secretKey, and webhookUrl must be a JSON array string like [{"webhook":"...","key":"..."}].

### Example 1: Create a Telegram notification channel

- CLI template: `alertdog run notify_channel_create --channelType <channelType> --name <name> [--chatId <chatId>] [--webhookUrl <webhookUrl>] [--secretKey <secretKey>]`
- Example CLI: `alertdog run notify_channel_create --channelType telegram --name "Ops Telegram" --chatId 123456`
### Example 2: Create a WeCom notification channel

- CLI template: `alertdog run notify_channel_create --channelType <channelType> --name <name> [--chatId <chatId>] [--webhookUrl <webhookUrl>] [--secretKey <secretKey>]`
- Example CLI: `alertdog run notify_channel_create --channelType wecom --name "Ops WeCom" --webhookUrl https://example.com`
### Example 3: Create a DingTalk notification channel

- CLI template: `alertdog run notify_channel_create --channelType <channelType> --name <name> [--chatId <chatId>] [--webhookUrl <webhookUrl>] [--secretKey <secretKey>]`
- Example CLI: `alertdog run notify_channel_create --channelType dingtalk --name "Ops DingTalk" --webhookUrl "[{\"webhook\":\"https://example.com/hook\",\"key\":\"secret\"}]" --secretKey secret`

## `notify_channel_bound_monitor_count`

Use this tool when the user wants to inspect how many monitors are currently bound to a notification channel. This is a read-only operation and does not modify any notification channel or monitor configuration.

### Command Summary

- Command: `alertdog run notify_channel_bound_monitor_count`
- Category: `notify-channel`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: READ
- Risk: `safe`
- Safe to retry: yes
- Recommended before: `notify_channel_list`

### Parameters

> `apiKey` is omitted from this table because `alertdog run` injects it from saved local auth.

| Parameter | Required | Type | Default | Rules | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | `integer \| string` | `-` | min > 0 ; minLength 1 | Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer. |

### Conditional Rules

- None.

### Example 1: Inspect how many monitors are bound to a channel

- CLI template: `alertdog run notify_channel_bound_monitor_count --id <id>`
- Example CLI: `alertdog run notify_channel_bound_monitor_count --id 1`

## `notify_channel_delete`

Use this tool only when the user explicitly wants to delete a notification channel. This is a write operation with side effects and will delete the specified channel.

### Command Summary

- Command: `alertdog run notify_channel_delete`
- Category: `notify-channel`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: WRITE
- Risk: `dangerous`
- Safe to retry: no
- Recommended before: `notify_channel_list`

### Parameters

> `apiKey` is omitted from this table because `alertdog run` injects it from saved local auth.

| Parameter | Required | Type | Default | Rules | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | `integer \| string` | `-` | min > 0 ; minLength 1 | Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer. |

### Conditional Rules

- None.

### Example 1: Delete a notification channel

- CLI template: `alertdog run notify_channel_delete --id <id>`
- Example CLI: `alertdog run notify_channel_delete --id 1`

## `notify_channel_set_default`

Use this tool only when the user explicitly wants to set a notification channel as the default channel. This is a write operation with side effects and will modify the default notification configuration.

### Command Summary

- Command: `alertdog run notify_channel_set_default`
- Category: `notify-channel`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: WRITE
- Risk: `caution`
- Safe to retry: no
- Recommended before: `notify_channel_list`

### Parameters

> `apiKey` is omitted from this table because `alertdog run` injects it from saved local auth.

| Parameter | Required | Type | Default | Rules | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | `integer \| string` | `-` | min > 0 ; minLength 1 | Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer. |

### Conditional Rules

- None.

### Example 1: Set a notification channel as the default channel

- CLI template: `alertdog run notify_channel_set_default --id <id>`
- Example CLI: `alertdog run notify_channel_set_default --id 1`

## `notify_channel_send_test`

Use this tool when the user wants to send a test message through a notification channel to verify connectivity. This is a write operation with side effects and sends one test notification.

### Command Summary

- Command: `alertdog run notify_channel_send_test`
- Category: `notify-channel`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: WRITE
- Risk: `caution`
- Safe to retry: no
- Recommended before: `notify_channel_list`

### Parameters

> `apiKey` is omitted from this table because `alertdog run` injects it from saved local auth.

| Parameter | Required | Type | Default | Rules | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | `integer \| string` | `-` | min > 0 ; minLength 1 | Notification channel id. Accepts a positive integer or a string that can be parsed into a positive integer. |

### Conditional Rules

- None.

### Example 1: Send a test message through a notification channel

- CLI template: `alertdog run notify_channel_send_test --id <id>`
- Example CLI: `alertdog run notify_channel_send_test --id 1`
