# 📊 Taverna — Performance Baseline

> **Project Fingerprint**: `SILLY_TAVERN__Q2M8`
> **Date**: 2026-03-06
> **Test Environment**: Ubuntu 24.04.4 | Node v22.22 | Python 3.12

## Latency Benchmark (MCP Bridges)

Measurements taken after 15 minutes of system uptime ("Test of Fire").

| Component  | Mean Latency | Median | StdDev (Jitter) | Status |
|------------|--------------|--------|-----------------|--------|
| **SQLite** | 1.38 ms      | 1.39 ms| 5.2%            | ✅ PASS |
| **Memory** | 1.43 ms      | 1.42 ms| 10.5%           | ✅ PASS |
| **Filesystem**| 1.45 ms    | 1.42 ms| 9.4%            | ✅ PASS |
| **Fetch**  | 1.43 ms      | 1.46 ms| 15.4%           | ✅ PASS |
| **n8n**    | 1.44 ms      | 1.47 ms| 14.2%           | ✅ PASS |

## Stability Criteria

- **Target**: Mean StdDev < 20% of Mean Latency.
- **Result**: **10.9%** (Average across all tested bridges).
- **Conclusion**: The local bridge infrastructure is highly stable and exhibits minimal jitter.

## Identified Bottlenecks

1. **Local Bridge Overhead**: Negligible (~1.4ms). The local Node.js bridge is NOT the source of the user's reported "slowness".
2. **External Dependencies**: Tier 3/4 bridges (n8n, GoogleDrive, Slack) are stable but their RTT will be significantly higher in real use due to network latency, but the *bridge itself* remains responsive.
3. **Primary Suspects for Lag**:
   - SillyTavern Frontend -> Bridge SSE connection management.
   - Large RAG context processing in Memory MCP.
   - External model (Ollama) inference time.

## Recommended Next Steps (Phase C)

- Implement asychronous message batching if message volume increases.
- Monitor SillyTavern's `console.log` for SSE connection dropped/re-established events.
