# Taverna — Environment Specification

> **Project Fingerprint**: `SILLY_TAVERN__Q2M8`
> **Last Updated**: 2026-03-06

## Runtime Versions

| Tool    | Version         |
|---------|-----------------|
| OS      | Ubuntu 24.04.4 LTS |
| Node.js | v22.22.0        |
| npm     | 10.9.4          |
| Python  | 3.12.3          |
| tmux    | 3.4             |
| Bash    | 5.2.21          |
| SQLite  | (bundled with Python 3.12) |

## Port Map

| Port  | Service               | Protocol | Required |
|-------|-----------------------|----------|----------|
| 8123  | SillyTavern Frontend  | HTTP     | ✅ Yes   |
| 5100  | SillyTavern Extras    | HTTP     | ⚡ Optional |
| 13001 | MCP: SQLite           | HTTP/SSE | ✅ Yes   |
| 13002 | MCP: Memory           | HTTP/SSE | ✅ Yes   |
| 13003 | MCP: Filesystem       | HTTP/SSE | ✅ Yes   |
| 13004 | MCP: Fetch            | HTTP/SSE | ✅ Yes   |
| 13005 | MCP: Git              | HTTP/SSE | ✅ Yes   |
| 13006 | MCP: Time             | HTTP/SSE | ✅ Yes   |
| 13007 | MCP: Puppeteer        | HTTP/SSE | ⚡ Optional |
| 13008 | MCP: SequentialThinking | HTTP/SSE | ⚡ Optional |
| 13009 | MCP: PostgreSQL       | HTTP/SSE | ⚡ Optional (⚿ DB) |
| 13010 | MCP: BraveSearch      | HTTP/SSE | ⚡ Optional (⚿ Key) |
| 13011 | MCP: GoogleMaps       | HTTP/SSE | ⚡ Optional (⚿ Key) |
| 13012 | MCP: GitHub           | HTTP/SSE | ⚡ Optional (⚿ Token) |
| 13013 | MCP: EverArt          | HTTP/SSE | ⚡ Optional (⚿ Key) |
| 13014 | MCP: Sentry           | HTTP/SSE | ⚡ Optional (⚿ Token) |
| 13015 | MCP: Slack            | HTTP/SSE | ⚡ Optional (⚿ Token) |
| 13016 | MCP: GoogleDrive      | HTTP/SSE | ⚡ Optional (⚿ OAuth) |
| 13017 | MCP: n8n              | HTTP/SSE | ⚡ Optional (⚿ Key) |
| 13018 | MCP: Docker           | HTTP/SSE | ⚡ Optional |
| 13019 | MCP: Redis            | HTTP/SSE | ⚡ Optional (⚿ Redis) |
| 13020 | MCP: Supabase         | HTTP/SSE | ⚡ Optional (⚿ Token) |

## Startup Order

1. `tmux` session `taverna_eco` is created
2. **Window 0**: SillyTavern (`npm start` in `SillyTavern/`) → port 8123
3. **Window 1**: ST-Extras (`python3 server.py` in `SillyTavern-extras/`) → port 5100
4. **Window 2**: MCP Bridges (`node mcp_bridges.js`) → ports 13001-13020

## Dependencies

### Node.js (Taverna root)
- `express` ^5.2.1
- `@modelcontextprotocol/sdk` ^1.27.1
- `jsonrpc-lite` ^2.2.0

### Python (SillyTavern-extras)
- See `SillyTavern-extras/requirements.txt`
- Requires virtual environment: `SillyTavern-extras/venv/`

### NPX (MCP Servers — downloaded on first run)
Each MCP bridge uses `npx -y` to pull its server package automatically.
No pre-installation needed, but first boot is slower.

## Verification

```bash
# Quick smoke test
./smoke_test.sh

# Verbose (shows raw healthcheck JSON)
./smoke_test.sh --verbose

# Manual single bridge check
curl http://localhost:13001/health
```
