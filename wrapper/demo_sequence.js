const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runSequenceDemo() {
    console.log("=== INICIANDO DEMO: ROLE EXECUTION SEQUENCE (PHASE 10) ===\n");
    
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    const GROUP_ID = "1772677610950"; // Cyberpunk group
    
    // 1. Configurar Roles
    console.log("[1] Configurando roles: 'master' y 'character'...");
    await ops.roleAssignModel('master', 'openai', 'gpt-4o', GROUP_ID);
    await ops.roleAssignPreset('master', 'Narrative-v2', GROUP_ID);
    
    await ops.roleAssignModel('character', 'kobold', 'antigravity-orchestrator-v1', GROUP_ID);
    await ops.roleAssignPreset('character', 'Taverna-Default', GROUP_ID);
    
    // Asignar personaje a 'character'
    const config = ops._loadGovernance();
    config.scenes[GROUP_ID].roles['character'].character_name = "Nova";
    config.scenes[GROUP_ID].roles['master'].character_name = "Director de Juego";
    ops._saveGovernance(config);

    // 2. Ejecutar Secuencia de Escena (Narrador -> Personaje)
    console.log(`\n[2] Ejecutando secuencia narrativa en grupo ${GROUP_ID}...`);
    const seqRes = await ops.sceneExecuteSequence(GROUP_ID, ['master', 'character']);

    console.log(`\nSequence Result: ${seqRes.ok ? 'SUCCESS' : 'FAIL'}`);
    console.log(`Verified: ${seqRes.verified}`);
    
    seqRes.observed_after.sequence_results.forEach((res, i) => {
        console.log(`  Step ${i+1} (${res.target}): ${res.action_taken}`);
        console.log(`    Trace: ${JSON.stringify(res.observed_after.trace)}`);
    });

    console.log("\n=== DEMO SEQUENCE FINALIZADA ===");
}

runSequenceDemo();
