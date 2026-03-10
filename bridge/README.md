# Taverna Bridge for Antigravity

Minimal CLI bridge to control SillyTavern via ST-Orchestrator.

## Configuration
Edit `bridge/config.sh` to match your SillyTavern URL.

## Usage

### 1. Verify Connectivity
```bash
bash bridge/probe.sh
```

### 2. Execute a Command
```bash
bash bridge/execute.sh "/echo Hello from Antigravity"
```

## How it works (The Contract)
- **Agent** -> `bridge/execute.sh` -> **SillyTavern Plugin** (`/execute`) -> **Command Queue**.
- **SillyTavern Browser** -> `polling` (`/poll`) -> **Execute local**.
