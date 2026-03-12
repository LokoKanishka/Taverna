/**
 * Demo: Source Selection Hardening (Phase 11B.5)
 * Validates role-based budgets, exclusion reasons, and conflict handling.
 */
const { TavernaOperations } = require('./operations');

async function runHardeningDemo() {
    console.log("=== TAVERNA SOURCE SELECTION HARDENING DEMO ===\n");

    const mockClient = {
        post: async (url, data) => {
            if (url === '/api/groups/all') {
                return { success: true, data: [{ id: "1772677610950", name: "The Alchemist's Lab", members: ["Seraphina", "Master Alchemist"] }] };
            }
            if (url === '/api/settings/get') {
                return { success: true, data: { settings: JSON.stringify({ api_server_default: "openai", temp_openai: "gpt-4o" }) } };
            }
            return { success: true, data: {} };
        },
        get: async (url) => ({ success: true, data: {} })
    };

    const ops = new TavernaOperations(mockClient);
    const sceneId = "1772677610950";

    // Test 1: MASTER Budget (High limit)
    console.log("--- TEST 1: MASTER ROLE (Full Access) ---");
    const masterRes = await ops.contextBuildForRole('master', sceneId);
    printTrace(masterRes);

    // Test 2: PLAYER Budget (Restricted visibility)
    console.log("\n--- TEST 2: PLAYER ROLE (Exclusion by Restriction) ---");
    const playerRes = await ops.contextBuildForRole('player', sceneId);
    printTrace(playerRes);

    // Test 3: SYSTEM Budget (Small limit to force exhaustion)
    // In actual implementation, we'd need to mock larger data or smaller budget.
    // For this demo, let's just see how SYSTEM (2048) behaves compared to Master (8192).
    console.log("\n--- TEST 3: SYSTEM ROLE (Low Budget) ---");
    const systemRes = await ops.contextBuildForRole('system', sceneId);
    printTrace(systemRes);
}

function printTrace(res) {
    if (!res.ok) {
        console.error("Error:", res.error);
        return;
    }
    console.log(`Role: ${res.role} | Budget Applied: ${res.context_compiled.match(/BUDGET: (\d+)/)[1]}`);
    console.log("Source Trace:");
    res.source_trace.forEach(s => {
        const status = s.included ? "✅" : `❌ (${s.exclusion_reason})`;
        console.log(`  - ${s.source_id.padEnd(15)} | ${status.padEnd(20)} | P:${s.priority} | Size:${s.size_estimate}`);
    });
    if (res.warnings.length > 0) {
        console.log("Warnings:", res.warnings);
    }
}

runHardeningDemo().catch(console.error);
