/**
 * Phase 11C: Persistent Memory Integration Demo
 * Logic: Verify read/write/snapshot and integration with contextComposer
 */
const { TavernaOperations } = require('./operations');

async function runDemo() {
    console.log("=== Phase 11C: Persistent Memory Demo ===\n");
    // Mock client to simulate SillyTavern API
    const mockClient = {
        post: async (url, data) => {
            if (url === '/api/groups/all') {
                return { success: true, data: [{ id: "group_lab_001", name: "The Alchemist's Lab", members: ["Seraphina"] }] };
            }
            if (url === '/api/settings/get') {
                return { success: true, data: { settings: JSON.stringify({ api_server_default: "openai", model_openai: "gpt-4o" }) } };
            }
            return { success: true, data: {} };
        },
        get: async (url) => ({ success: true, data: {} })
    };

    const ops = new TavernaOperations(mockClient);

    const GROUP_ID = "group_lab_001";
    
    // 1. Write Scene Memory
    console.log("1. Writing Scene Memory...");
    const writeRes = await ops.memoryWrite('scene', GROUP_ID, {
        summary: "The adventurers found a strange vaccine in the lab.",
        last_event: "Door was hacked but Lorebook says it's magical."
    });
    console.log("Result:", JSON.stringify(writeRes, null, 2));

    // 2. Write Character Memory
    console.log("\n2. Writing Character Memory (Default Avatar)...");
    const charWriteRes = await ops.memoryWrite('character', 'default', {
        inner_thought: "I don't trust the Master today.",
        relationship_status: "Suspicious of robots."
    });
    console.log("Result:", JSON.stringify(charWriteRes, null, 2));

    // 3. Snapshot Memory
    console.log("\n3. Taking Memory Snapshot...");
    const snapshotRes = await ops.memorySnapshot('scene');
    console.log("Scene Memory Keys:", Object.keys(snapshotRes.observed_after));

    // 4. Build Context for Master (Should see scene memory, no char memory)
    console.log("\n4. Building Context [Role: Master]...");
    const masterCtx = await ops.contextBuildForRole('master', GROUP_ID);
    console.log("Included Sources:", masterCtx.included_sources);
    const hasSceneMem = masterCtx.context_compiled.includes("MEMORY SCENE");
    const hasCharMem = masterCtx.context_compiled.includes("MEMORY CHAR");
    console.log(`Contains Scene Memory: ${hasSceneMem}`);
    console.log(`Contains Character Memory: ${hasCharMem}`);

    // 5. Build Context for Character (Should see both)
    console.log("\n5. Building Context [Role: Character]...");
    const charCtx = await ops.contextBuildForRole('character', GROUP_ID);
    console.log("Included Sources:", charCtx.included_sources);
    const charHasSceneMem = charCtx.context_compiled.includes("MEMORY SCENE");
    const charHasCharMem = charCtx.context_compiled.includes("MEMORY CHAR");
    console.log(`Contains Scene Memory: ${charHasSceneMem}`);
    console.log(`Contains Character Memory: ${charHasCharMem}`);

    console.log("\n=== Demo Complete ===");
}

runDemo().catch(console.error);
