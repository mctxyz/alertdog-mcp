# AlertDog MCP

AlertDog supports two integration modes:

1. **MCP installation** for MCP-compatible clients
2. **Agent / Skill installation** for agents that support Skills

##  Installation

### Option 1: Install the npm package globally

Install:

```bash
npm install -g @alertdog/mcp@latest
```

Start:

```bash
alertdog-mcp
```

### Option 2: Configure it through `npx` in your MCP client

Recommended configuration:

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

When the stdio server starts, it prints a version line to `stderr`, for example:

```text
[AlertDog] stdio version=1.0.0
```

## Agent / Skill Installation

The skill entrypoint in this repository is:

- `skills/SKILL.md`

Reference documents are located in:

- `skills/references/apikey-skill.md`
- `skills/references/cex-monitor-skill.md`
- `skills/references/notify-channel-skill.md`

If your agent supports Skills installation, you can install the `alertdog` skill from this repository.

Recommended command:

```bash
npx skills add mctxyz/alertdog-mcp --skill alertdog
```

If your Skills tool expects a full repository URL, use:

```bash
npx skills add https://github.com/mctxyz/alertdog-mcp --skill alertdog
```

## Auth

It is recommended to install the CLI first so you can store the local API key:

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

## Generate Skill Docs Locally

If you are maintaining the skill docs inside this repository, run:

```bash
node dev-scripts/generate-skill-docs.mjs
```

Or use the root script:

```bash
yarn build:skills
```
