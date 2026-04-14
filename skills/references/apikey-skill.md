---
name: alertdog-apikey
description: Use this category when the task is about onboarding, validating, or rotating AlertDog API keys.
---

# AlertDog API Key

## When To Use This Skill

Use this category when the task is about onboarding, validating, or rotating AlertDog API keys.

## Before You Start

- If the command needs authentication, run `alertdog auth show` first.
- If auth is missing, guide the user to run `alertdog auth set --apikey="$APIKEY"`.
- After auth is saved, use `alertdog run <tool-name>` and do not pass `--apikey`.
- Never ask the user to paste secrets into chat.
- Prefer loading only this file plus the root `SKILL.md` unless the user explicitly needs a broader catalog.

## Command Index

| Command | Type | Auth | Risk | Description |
| --- | --- | --- | --- | --- |
| `alertdog run apikey_usage_guide` | READ | Public | `safe` | Use this tool when the user does not know how to get started with AlertDog MCP or is unsure how apiKey should be provided. This tool only returns usage guidance and does not read or modify any user data. |
| `alertdog run apikey_get` | READ | Saved auth | `safe` | Use this tool when the user wants to validate the current AlertDog apiKey or inspect apiKey details. This is a read-only operation and does not modify the existing apiKey. If the user is just starting the setup flow, prefer apikey_usage_guide first. |
| `alertdog run apikey_create` | WRITE | Saved auth | `caution` | Use this tool when the user needs to create a new AlertDog apiKey for the current account. This is a write operation with side effects. If an apiKey may already exist and the user only wants to inspect it, prefer apikey_get first. |
| `alertdog run apikey_regenerate` | WRITE | Saved auth | `dangerous` | Use this tool only when the user explicitly wants to rotate, reset, or regenerate their AlertDog apiKey. This is a write operation with side effects. If the user only wants to check whether the current apiKey is valid, prefer apikey_get first. |


## How To Work With This Skill

1. Match the user intent to one command in the index.
2. Read the parameter table for that command.
3. Respect required fields, default values, enum ranges, and conditional rules from `inputSchema`.
4. For WRITE commands, make sure the user explicitly asked for the state-changing action before executing.

## `apikey_usage_guide`

Use this tool when the user does not know how to get started with AlertDog MCP or is unsure how apiKey should be provided. This tool only returns usage guidance and does not read or modify any user data.

### Command Summary

- Command: `alertdog run apikey_usage_guide`
- Category: `apikey`
- Auth: No apiKey required
- Type: READ
- Risk: `safe`
- Safe to retry: yes

### Parameters

This tool does not accept structured input parameters.

### Conditional Rules

- None.

### Example 1: Read the onboarding steps before the first authenticated call

- CLI template: `alertdog run apikey_usage_guide`

## `apikey_get`

Use this tool when the user wants to validate the current AlertDog apiKey or inspect apiKey details. This is a read-only operation and does not modify the existing apiKey. If the user is just starting the setup flow, prefer apikey_usage_guide first.

### Command Summary

- Command: `alertdog run apikey_get`
- Category: `apikey`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: READ
- Risk: `safe`
- Safe to retry: yes

### Parameters

This tool does not require explicit runtime parameters. Authentication is loaded from saved local `alertdog auth` config.

### Conditional Rules

- None.

### Example 1: Validate the current apiKey

- CLI template: `alertdog run apikey_get`
- Example CLI: `alertdog run apikey_get`

## `apikey_create`

Use this tool when the user needs to create a new AlertDog apiKey for the current account. This is a write operation with side effects. If an apiKey may already exist and the user only wants to inspect it, prefer apikey_get first.

### Command Summary

- Command: `alertdog run apikey_create`
- Category: `apikey`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: WRITE
- Risk: `caution`
- Safe to retry: no
- Recommended before: `apikey_get`

### Parameters

This tool does not require explicit runtime parameters. Authentication is loaded from saved local `alertdog auth` config.

### Conditional Rules

- None.

### Example 1: Create a new apiKey for the current user account

- CLI template: `alertdog run apikey_create`
- Example CLI: `alertdog run apikey_create`

## `apikey_regenerate`

Use this tool only when the user explicitly wants to rotate, reset, or regenerate their AlertDog apiKey. This is a write operation with side effects. If the user only wants to check whether the current apiKey is valid, prefer apikey_get first.

### Command Summary

- Command: `alertdog run apikey_regenerate`
- Category: `apikey`
- Auth: Uses saved local apiKey from `alertdog auth`
- Type: WRITE
- Risk: `dangerous`
- Safe to retry: no
- Recommended before: `apikey_get`

### Parameters

This tool does not require explicit runtime parameters. Authentication is loaded from saved local `alertdog auth` config.

### Conditional Rules

- None.

### Example 1: Rotate the apiKey only when the user explicitly asks for it

- CLI template: `alertdog run apikey_regenerate`
- Example CLI: `alertdog run apikey_regenerate`
