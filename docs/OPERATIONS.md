# Taverna-v2 Operations

Manual and automated operations for management.

## Prerequisites

- An existing [SillyTavern](https://github.com/SillyTavern/SillyTavern) installation.
- Node.js and npm (compatibile with your SillyTavern version).
- `curl` for smoke testing.

## Installation

Taverna-v2 is installed as a plugin/extension within your SillyTavern directory.

```bash
# 1. Install Backend Plugin
# This stages the files in SillyTavern/plugins/ST-Orchestrator
bash scripts/install_backend.sh /path/to/SillyTavern

# 2. Build Backend
# Mandatory for the first time or after updates
cd /path/to/SillyTavern/plugins/ST-Orchestrator
npm install
npm run build

# 3. Install Frontend Extension
# This installs the extension in SillyTavern/data/default-user/extensions/ST-Orchestrator
bash scripts/install_frontend.sh /path/to/SillyTavern
```

## Health Check

```bash
bash scripts/doctor.sh
```

## Testing the Circuit

1. Ensure SillyTavern is running.
2. Run smoke test:
```bash
bash scripts/smoke_test.sh http://localhost:8000
```

## Antigravity Bridge Usage

The `bridge/` directory contains minimal scripts for external interaction:

- `bridge/probe.sh`: Health check.
- `bridge/execute.sh "COMMAND"`: Enqueue any STscript command.

Example for Antigravity:
```bash
./bridge/execute.sh "/model MyModel"
```

## Troubleshooting

- **Backend not responding:** Ensure the plugin is in `plugins/` and dependencies are installed. Check ST console logs for `[ST-Orchestrator]`.
- **Commands not executing:** Open Browser DevTools in SillyTavern and check for `[ST-Orchestrator]` console logs. If you see "Failed to load slash-commands.js", verify the relative path in `frontend/index.js`.
