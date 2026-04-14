# AlertDog MCP Packages

这个子项目把 AlertDog 的本地调用能力拆成 4 个包：

- `packages/core`
  - AlertDog REST API client
  - tool registry
  - tool executors
  - 统一的请求头、版本信息和工具契约
- `packages/cli`
  - cli 本地调用入口
  - `alertdog run <tool-name>` 风格的命令行执行器
  - 本地 auth 配置读写
- `packages/mcp`
  - stdio MCP server
  - 对外暴露 MCP tools
  - 内部直接调用 `@alertdog/core`
- `packages/skills`
  - 根 skill 与分类 references



## 当前架构


请求链路只有两种：

### 1. CLI one-shot

```text
shell
  -> packages/cli/dist/index.js
  -> @alertdog/core
  -> AlertDog REST API
```

### 2. stdio MCP

```text
MCP client
  -> packages/mcp/dist/stdio.js
  -> @alertdog/core
  -> AlertDog REST API
```

也就是说：

- `cli` 是 one-shot 执行层
- `mcp` 是 MCP 协议适配层
- `core` 是统一业务执行层
- `skills` 是给 agent 读取的文档层

## Workspace Layout

每个运行时包各自产出自己的 `dist/`，`skills` 直接写源码目录：

```text
packages/
  core/
    dist/
  cli/
    dist/
  mcp/
    dist/
  skills/
    SKILL.md
    references/
```

关键入口：

- CLI
  - `packages/cli/dist/index.js`
- stdio MCP
  - `packages/mcp/dist/stdio.js`
- skills 文档
  - `packages/skills/SKILL.md`
  - `packages/skills/references/*.md`

## Build

要求：

- Node.js `>=18`
- 推荐直接使用 Node 20

根构建命令：

```bash
cd /absolute/path/to/mcp
yarn build
```

它会按顺序执行：

1. `@alertdog/core`
2. `@alertdog/cli`
3. `@alertdog/mcp`
4. workspace link
5. `@alertdog/skills`

单独构建：

```bash
yarn build:core
yarn build:cli
yarn build:mcp
yarn build:skills
```

单独重生成 skills 文档：

```bash
yarn generate:skill-docs
```

## Runtime

### 运行 CLI

```bash
cd /absolute/path/to/mcp
node packages/cli/dist/index.js list-tools
```

查询监控列表：

```bash
node packages/cli/dist/index.js run cex_candle_signal_subscription_list --limit 20
```

CLI 启动时会把当前版本打印到 `stderr`，格式类似：

```text
[AlertDog] cli version=1.0.0
```

### 运行 stdio MCP

```bash
npx alertdog-mcp
```

启动后会在 `stderr` 打印：

```text
[AlertDog] stdio version=1.0.0
```

给 MCP client 配置时，推荐直接使用命令模式，例如：

```json
{
  "mcpServers": {
    "alertdog": {
      "command": "npx",
      "args": ["-y","@alertdog/mcp"]
    }
  }
}
```

## API Key And Auth

推荐先安装 CLI：

```bash
npm install -g @alertdog/cli
```

保存本地 apikey：

```bash
alertdog auth set --apikey="$APIKEY"
```

查看当前配置：

```bash
alertdog auth show
```

清除当前配置：

```bash
alertdog auth clear
```

运行工具时，优先使用：

```bash
alertdog run <tool-name>
```

如果是直接调用打包后的入口，也可以：

```bash
node packages/cli/dist/index.js run <tool-name>
```

auth 读取优先级：

1. 命令行显式传入的 `--apikey=...`
2. `~/.alertdog-mcp/config.json`
3. `ALERTDOG_API_KEY`
4. `APIKEY`

对于已经保存过 auth 的常规使用场景，不需要再给业务命令传 `--apikey`。

## Implemented Tools

当前已经实现的 tool 按分类如下。

### API Key

- `apikey_usage_guide`
  - 返回 AlertDog apiKey 的使用引导，适合首次接入或不清楚认证方式时使用。
- `apikey_get`
  - 读取当前账号的 apiKey 信息或校验当前 key 是否可用，不会修改数据。
- `apikey_create`
  - 为当前账号创建新的 apiKey，是一个有副作用的写操作。
- `apikey_regenerate`
  - 重新生成现有 apiKey，适合显式要求轮换或重置 key 的场景。

### Notify Channel

- `notify_channel_list`
  - 列出当前账号下可用的通知渠道。
- `notify_channel_create`
  - 创建通知渠道，支持 Telegram、Discord、DingTalk、Feishu、WeCom、Webhook、Bark。
- `notify_channel_bound_monitor_count`
  - 查看某个通知渠道当前绑定了多少监控。
- `notify_channel_delete`
  - 删除指定通知渠道。
- `notify_channel_set_default`
  - 把指定通知渠道设置为默认渠道。
- `notify_channel_send_test`
  - 向指定通知渠道发送测试消息，验证连通性。

### CEX Monitor

- `cex_asset_search`
  - 按 symbol、name 或关键字搜索 CEX 资产，是公开只读接口。
- `cex_price_subscription_create`
  - 创建 CEX 价格监控订阅，支持价格条件、交易所、通知间隔和通知渠道配置。
- `cex_price_subscription_list`
  - 查看当前账号下的 CEX 价格监控订阅列表。
- `cex_price_subscription_set_disabled`
  - 批量启用或禁用一个或多个 CEX 价格监控订阅。
- `cex_price_subscription_delete`
  - 删除一个或多个 CEX 价格监控订阅。
- `cex_offical_candle_signal_feed_list`
  - 查看官方 CEX candle signal feed 的最新分页数据。
- `cex_candle_signal_subscription_create`
  - 创建官方 CEX candle signal 订阅，支持周期、成交量阈值、方向、交易所和通知配置。
- `cex_candle_signal_subscription_update`
  - 更新已有的官方 CEX candle signal 订阅。
- `cex_candle_signal_subscription_list`
  - 查看当前账号下的官方 CEX candle signal 订阅列表。
- `cex_candle_signal_subscription_notify_history_list`
  - 查看当前用户 candle signal 订阅产生的通知触发历史，支持基于 cursor 的分页。
- `cex_candle_signal_subscription_set_disabled`
  - 批量启用或禁用一个或多个官方 CEX candle signal 订阅。
- `cex_candle_signal_subscription_delete`
  - 删除一个或多个官方 CEX candle signal 订阅。

## CLI Usage

当前 CLI 支持：

- `list-tools`
- `run <tool-name>`
- `call <tool-name>`
- `auth set`
- `auth show`
- `auth clear`

其中推荐统一使用 `run`。

默认输出是适合人直接阅读的格式；如果需要脚本消费结构化结果，可以追加 `--json`。

### JSON 入参模式

```bash
node packages/cli/dist/index.js run cex_price_subscription_list '{"limit":20}'
```

### JSON 输出模式

```bash
node packages/cli/dist/index.js run cex_price_subscription_list --limit 20 --json
```

### Flag 入参模式

```bash
node packages/cli/dist/index.js run cex_candle_signal_subscription_notify_history_list --subscribe_id 12 --cursor 0 --limit 100 --desc true
```

也支持更长的写命令：

```bash
node packages/cli/dist/index.js run cex_price_subscription_create \
  --asset_id 2 \
  --monitor_type 1 \
  --monitor_interval 60 \
  --type 1 \
  --symbol 1 \
  --value 10 \
  --exchanges binance,okex,bybit \
  --channels 3595 \
  --notify_interval 300
```

参数解析规则：

- `--key value` 支持
- `--key=value` 支持
- `true/false` 自动转布尔
- 整数字符串自动转数字
- 逗号分隔字符串自动转数组
- JSON 数组字符串会保留原样，适用于钉钉等复杂 webhook 参数

## Skills

`packages/skills` 直接保存源码级 skill 文档：

- `packages/skills/SKILL.md`
- `packages/skills/references/apikey-skill.md`
- `packages/skills/references/cex-monitor-skill.md`
- `packages/skills/references/notify-channel-skill.md`

这些文档由下面的脚本生成：

```bash
node dev-scripts/generate-skill-docs.mjs
```
