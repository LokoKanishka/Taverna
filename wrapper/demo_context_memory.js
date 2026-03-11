const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runContextDemo() {
    console.log("=== INICIANDO DEMO: CONTEXT, MEMORY & STATE GOVERNANCE (PHASE 11) ===\n");
    
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    const GROUP_ID = "1772677610950"; // Cyberpunk group
    const MASTER_ROLE = "master";
    const CHAR_ROLE = "character";

    // 1. Inicializar Estado de Escena
    console.log("[1] Inicializando estado de la escena...");
    await ops.sceneStateUpdate(GROUP_ID, {
        current_location: "Night City - Sector 4",
        time_of_day: "Midnight",
        plot_tension: 0.8,
        active_threats: ["Arasaka Patrol"]
    });

    // 2. Snapshot del Estado
    const stateSnap = await ops.sceneStateSnapshot(GROUP_ID);
    console.log("Scene State Snapshot:", JSON.stringify(stateSnap.observed_after, null, 2));

    // 3. Construir Contexto para el Master
    console.log(`\n[3] Construyendo contexto para rol '${MASTER_ROLE}'...`);
    const masterCtx = await ops.contextBuildForRole(GROUP_ID, MASTER_ROLE);
    console.log("Master Context Sources:", JSON.stringify(masterCtx.observed_after.sources, null, 2));

    // 4. Construir Contexto para el Personaje
    console.log(`\n[4] Construyendo contexto para rol '${CHAR_ROLE}'...`);
    const charCtx = await ops.contextBuildForRole(GROUP_ID, CHAR_ROLE);
    console.log("Character Context Sources:", JSON.stringify(charCtx.observed_after.sources, null, 2));

    // 5. Verificar Entradas (Caso Positivo)
    console.log("\n[5] Verificando integridad de entradas (MASTER)...");
    const verifyMaster = await ops.contextVerifyInputs(GROUP_ID, MASTER_ROLE);
    console.log("Verify Master Result:", verifyMaster.observed_after.valid ? "VALID" : "INVALID", verifyMaster.warnings || "");

    // 6. Diferencia de Estado (Simular Progresión)
    console.log("\n[6] Simulando progresión de estado...");
    const prevState = { ...stateSnap.observed_after };
    await ops.sceneStateUpdate(GROUP_ID, { plot_tension: 0.9, last_action: "Cyberdeck hacked" });
    const diff = await ops.sceneStateDiff(GROUP_ID, prevState);
    console.log("State Diff:", JSON.stringify(diff.observed_after, null, 2));

    // 7. Política de Escritura (Autorización)
    console.log("\n[7] Verificando políticas de escritura de memoria...");
    const masterCanWrite = await ops.memoryWritePolicy(MASTER_ROLE, 'state', { some: 'data' });
    console.log(`Master can write to 'state': ${masterCanWrite.ok}`);

    const charCanWrite = await ops.memoryWritePolicy(CHAR_ROLE, 'state', { some: 'data' });
    console.log(`Character can write to 'state': ${charCanWrite.ok} (Expected: false)`);

    // 8. Caso Negativo: Fuente Faltante
    console.log("\n[8] Caso Negativo: Verificando rol inexistente/ambiguo...");
    const verifyNegative = await ops.contextVerifyInputs(GROUP_ID, 'unknown_role');
    console.log("Verify Negative Result:", verifyNegative.observed_after.valid ? "VALID" : "INVALID");
    console.log("Warnings:", verifyNegative.observed_after.warnings);

    console.log("\n=== DEMO CONTEXT & MEMORY FINALIZADA ===");
}

runContextDemo().catch(err => {
    console.error("DEMO FAILED:", err);
});
