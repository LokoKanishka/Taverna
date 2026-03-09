# Taverna-v2 Operations

Manual and automated operations for management.

## Installation

Use the provided scripts:

```bash
# 1. Install Backend
bash scripts/install_backend.sh /path/to/SillyTavern

# 2. Build Backend (mandatory for first time)
cd /path/to/SillyTavern/plugins/ST-Orchestrator
npm install
npm run build

# 3. Install Frontend
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

## Troubleshooting

- **Backend not responding:** Ensure the plugin is in `plugins/` and dependencies are installed. Check ST console logs for `[ST-Orchestrator]`.
- **Commands not executing:** Open Browser DevTools in SillyTavern and check for `[ST-Orchestrator]` console logs. If you see "Failed to load slash-commands.js", verify the relative path in `frontend/index.js`.
