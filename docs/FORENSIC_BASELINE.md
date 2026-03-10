# Forensic Baseline: Taverna Proto

Evidence-based snapshot of the legacy prototype before any reconstruction.

## Git Identities

### Root Repo (Taverna)
- **Repo Path:** `/home/lucy-ubuntu/Escritorio/Taverna`
- **SHA:** `68778a52b9614d0f3251156097e0624887c9a92c`
- **Branch:** `main`

### SillyTavern Runtime (Nested Git)
- **Path:** `/home/lucy-ubuntu/Escritorio/Taverna/SillyTavern`
- **SHA:** `6172440740612682fbe4bcdd4cbebeb7181f8dfc`
- **Branch:** `staging`
- **Status:** Ignored by root Git repository.

### ST-Orchestrator Plugin (Nested Git inside SillyTavern)
- **Path:** `/home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/plugins/ST-Orchestrator`
- **SHA:** `65f0fe753b0ac588255c25091b1291c85967e08f`
- **Branch:** `main`
- **Identity:** Template modified for Taverna logic.

## Modified Files
The following files in ST-Orchestrator have local modifications compared to its base template:

- `src/index.ts`: Added orchestration logic (command queue, endpoints).
- `dist/plugin.js`: Compiled build of the modified source.
- `package-lock.json`: Dependency updates.

## Core Component Paths

- **Backend Logic:** `/home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/plugins/ST-Orchestrator/src/index.ts`
- **Client Extension:** `/home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/data/default-user/extensions/ST-Orchestrator/index.js`
- **Build Artifact:** `/home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/plugins/ST-Orchestrator/dist/plugin.js`

---
*Created on 2026-03-09 for reconstruction audit.*
