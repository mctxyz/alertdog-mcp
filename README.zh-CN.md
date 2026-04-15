# AlertDog MCP

AlertDog 提供两种接入方式：

1. **MCP 安装方式**：给支持 MCP 的客户端使用
2. **Agent 安装方式**：给支持 Skills 的 agent 使用

##  安装

### 方式 1：直接使用 npm 包

安装：

```bash
npm install -g @alertdog/mcp@latest
```

启动：

```bash
alertdog-mcp
```

### 方式 2：在 MCP client 里通过 `npx` 配置

推荐配置：

```json
{
  "mcpServers": {
    "alertdog": {
      "command": "npx",
      "args": ["-y", "@alertdog/mcp@latest"]
    }
  }
}
```

启动后会在 `stderr` 输出版本信息，例如：

```text
[AlertDog] stdio version=1.0.0
```

## Agent / Skill 安装

本仓库内置的 skill 入口在：

- `skills/SKILL.md`

分类参考文档在：

- `skills/references/apikey-skill.md`
- `skills/references/cex-monitor-skill.md`
- `skills/references/notify-channel-skill.md`

如果你的 agent 支持 Skills 安装，可从当前仓库安装 `alertdog` skill。

推荐命令：

```bash
npx skills add mctxyz/alertdog-mcp --skill alertdog
```

如果你的 Skills 工具要求完整仓库地址，也可以使用：

```bash
npx skills add https://github.com/mctxyz/alertdog-mcp --skill alertdog
```

## Auth

建议先安装 CLI 来保存本地 apikey：

```bash
npm install -g @alertdog/cli
```

保存：

```bash
alertdog auth set --apikey="$APIKEY"
```

查看：

```bash
alertdog auth show
```

清除：

```bash
alertdog auth clear
```
