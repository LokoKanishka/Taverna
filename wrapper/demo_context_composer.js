/**
 * Demo: Context Composer (Phase 11B)
 * Validates role-based context building with explicit source separation.
 */
const { TavernaOperations } = require('./operations');

async function runDemo() {
    console.log("=== TAVERNA CONTEXT COMPOSER DEMO ===\n");

    // Mock client to simulate SillyTavern API
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

    const roles = ['master', 'character', 'player'];
    const sceneId = "1772677610950";

    for (const role of roles) {
        console.log(`\n--- Building Context for Role: ${role.toUpperCase()} ---`);
        const result = await ops.contextBuildForRole(role, sceneId);
        
        if (result.ok) {
            console.log(`Operation: ${result.operation}`);
            console.log(`Included:  [${result.included_sources.join(', ')}]`);
            console.log(`Excluded:  [${result.excluded_sources.join(', ')}]`);
            if (result.warnings.length > 0) console.log(`Warnings:  ${result.warnings.join(' | ')}`);
            console.log(`Traceability Partial: ${result.traceability_partial}`);
            console.log(`\nCompiled Snippet:\n${result.context_compiled.substring(0, 200)}...`);
        } else {
            console.error(`Error: ${result.error}`);
        }
    }
}

runDemo().catch(console.error);
