const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function main() {
    console.log("==========================================");
    console.log(" TAVERNA TOTAL CONTROL - SCENE & ROLES    ");
    console.log(" PHASE 9D DEMOSTRATION                    ");
    console.log("==========================================\n");

    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    const check = await ops.healthStatus();
    if (!check.operation_ok) {
        console.error("❌ SillyTavern API is not accessible. Aborting.");
        process.exit(1);
    }

    async function logResult(res) {
        console.log(`▶️  OPERATION: ${res.operation}`);
        console.log(`   [OK]        => ${res.ok}`);
        if (res.target) console.log(`   [TARGET]    => ${res.target}`);
        if (res.action_taken) console.log(`   [ACTION]    => ${res.action_taken}`);
        if (res.verified) console.log(`   [VERIFIED]  => ${res.verified}`);
        if (res.error) console.log(`   [ERROR]     => ${res.error}`);
        console.log("");
    }

    // 1. Listar grupos reales
    const listRes = await ops.groupList();
    logResult(listRes);
    
    if (!listRes.ok || listRes.observed_after.length === 0) {
        console.error("❌ No groups found for demo. Please create a group in ST first.");
        return;
    }

    const targetGroup = listRes.observed_after[0];
    const groupId = targetGroup.id;
    console.log(`Selected Group for Demo: ${targetGroup.name} (${groupId})\n`);

    // 2. Leer un grupo real
    const readRes = await ops.groupRead(groupId);
    logResult(readRes);
    console.log(`Members: ${JSON.stringify(readRes.observed_after.members)}\n`);

    // 3. Asignar modelo al rol "master" (Global)
    const assignMasterRes = await ops.roleAssignModel('master', 'openai', 'gpt-4o');
    logResult(assignMasterRes);

    // 4. Asignar modelo al rol "player" (Per-Group Override)
    const assignPlayerRes = await ops.roleAssignModel('player', 'anthropic', 'claude-3-5-sonnet', groupId);
    logResult(assignPlayerRes);

    // 5. Asignar preset por rol
    const assignPresetRes = await ops.roleAssignPreset('master', 'Divine High-Instruct');
    logResult(assignPresetRes);

    // 6. Verificar asignación
    const verifyRes = await ops.roleVerifyAssignment('player', groupId);
    logResult(verifyRes);

    // 7. Generar Scene Snapshot
    const snapshotRes = await ops.sceneSnapshot(groupId);
    logResult(snapshotRes);
    
    if (snapshotRes.ok) {
        console.log("--- SNAPSHOT PREVIEW ---");
        console.log(`Timestamp: ${snapshotRes.observed_after.timestamp}`);
        console.log(`Group Name: ${snapshotRes.observed_after.group.name}`);
        console.log(`Local Overrides: ${JSON.stringify(snapshotRes.observed_after.role_policy.local_overrides)}`);
        console.log(`Global Policies: ${JSON.stringify(snapshotRes.observed_after.role_policy.effective_globals)}`);
        console.log("------------------------\n");
    }

    console.log("==========================================");
    console.log(" DONE.");
    console.log("==========================================\n");
}

main().catch(console.error);
