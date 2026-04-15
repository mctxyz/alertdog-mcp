# AlertDog MCP

[English](./README.md)

AlertDog 提供两种接入方式：

1. **MCP 安装方式**：给支持 MCP 的客户端使用
2. **Agent 安装方式**：给支持 Skills 的 agent 使用

## 安装


### Agent / Skill 安装

向 agent 发送下面这条命令即可：

```bash
npx skills add https://github.com/mctxyz/alertdog-mcp --skill alertdog
```

###  MCP 安装


```bash
npm install -g @alertdog/mcp@latest
```
## 配置凭证
创建 ~/.alertdog-mcp/config.json

```json

{
    "apiKey": "your-api-key"
}
```

## 执行
```bash
alertdog-mcp
```

**Claude Desktop 配置**

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

**Codex 配置**

```toml
[mcp_servers.alertdog]
command = "npx"
args = ["-y", "@alertdog/mcp@latest"]
```

## 通过命令行设置凭证

```bash
npm install -g @alertdog/cli
```

保存 apikey：

```bash
alertdog auth set --apikey="$APIKEY"
```

查看当前配置：

```bash
alertdog auth show
```

清除配置：

```bash
alertdog auth clear
```
