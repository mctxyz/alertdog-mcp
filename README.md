# AlertDog MCP

[中文](./README.zh-cn.md)

AlertDog supports two integration modes:

1. **MCP installation** for MCP-compatible clients
2. **Agent installation** for agents that support Skills

## Installation

### Agent / Skill Installation

Send the following command to your agent:

```bash
npx skills add https://github.com/mctxyz/alertdog-mcp --skill alertdog
```

### MCP Installation

```bash
npm install -g @alertdog/mcp@latest
```

## Configure Credentials

Create `~/.alertdog-mcp/config.json`:

```json
{
  "apiKey": "your-api-key"
}
```

## Run

```bash
alertdog-mcp
```

**Claude Desktop configuration**

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

**Codex configuration**

```toml
[mcp_servers.alertdog]
command = "npx"
args = ["-y", "@alertdog/mcp@latest"]
```

## Configure Credentials via CLI

```bash
npm install -g @alertdog/cli
```

Save the API key:

```bash
alertdog auth set --apikey="$APIKEY"
```

Show the current configuration:

```bash
alertdog auth show
```

Clear the current configuration:

```bash
alertdog auth clear
```
