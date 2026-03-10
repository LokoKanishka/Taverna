# Taverna-v2

**Orchestration Bridge for SillyTavern.**

Taverna-v2 is a bridge/plugin designed to install over an existing SillyTavern instance. It is NOT a standalone ecosystem and does not include SillyTavern in its repository.

## What is Taverna-v2?
- **It IS:** A bridge that provides a remote control API (`/probe`, `/execute`, `/poll`) for SillyTavern.
- **It IS:** A combination of a Backend Plugin and a Frontend Extension for SillyTavern.
- **It IS NOT:** A clone-and-run full stack. It requires a pre-installed SillyTavern.

## Project Goal
**Antigravity / VS Code** -> **Taverna-v2** -> **SillyTavern** -> **Full Control.**

## Quick Start
1. **Prerequisite:** Have a local [SillyTavern](https://github.com/SillyTavern/SillyTavern) installation.
2. **Install Backend:** `bash scripts/install_backend.sh /path/to/SillyTavern`
3. **Install Frontend:** `bash scripts/install_frontend.sh /path/to/SillyTavern`
4. **Setup:** Go to your SillyTavern directory, run `npm install` and `npm run build` in `plugins/ST-Orchestrator`.

Check `docs/OPERATIONS.md` for detailed installation instructions.

## Health Check & Verification
- **Static Check:** Run `bash scripts/doctor.sh` to verify repository and installation integrity.
- **Circuit Smoke Test:** Run `bash scripts/smoke_test.sh http://localhost:8000` (requires a running SillyTavern instance).
- **Note:** `doctor.sh` is the primary health check; full E2E orchestration tests are part of the operational stage.

## Structure
- `/orchestrator`: Backend Plugin & Frontend Extension code.
- `/bridge`: High-level interaction scripts for external agents.
- `/scripts`: Installation and diagnostic tools.
- `/docs`: Documentation and architecture.

---
*Mantenible, mínimo y deliberado.*
