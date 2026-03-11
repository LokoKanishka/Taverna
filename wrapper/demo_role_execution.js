const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runDemo() {
    console.log("=== INICIANDO DEMO: ROLE EXECUTION ORCHESTRATION (PHASE 10) ===\n");
    
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    const GROUP_ID = "1772677610950"; // Cyberpunk group
    const ROLE_ID = "character";
    const TARGET_CHAR = "Nova";

    // 1. Verificar Conectividad
    const health = await ops.healthStatus();
    console.log(`[1] Health Check: ${health.verified ? 'PASS' : 'FAIL'}`);
    if (!health.verified) return;

    // 2. Configurar Política de Rol para la Escena
    console.log(`[2] Configurando política para rol '${ROLE_ID}' en grupo ${GROUP_ID}...`);
    
    // Asignar modelo y preset (valores ficticios/de prueba controlables)
    await ops.roleAssignModel(ROLE_ID, 'kobold', 'antigravity-orchestrator-v1', GROUP_ID);
    await ops.roleAssignPreset(ROLE_ID, 'Taverna-Default', GROUP_ID);
    
    // Inyectar metadato de personaje en la política (no persistido en SillyTavern, sino en Taverna)
    const config = ops._loadGovernance();
    config.scenes[GROUP_ID].roles[ROLE_ID].character_name = TARGET_CHAR;
    ops._saveGovernance(config);

    // 3. Resolver Política en Tiempo de Ejecución
    const policy = await ops.roleResolveRuntimePolicy(ROLE_ID, GROUP_ID);
    console.log(`[3] Política Resuelta:`, JSON.stringify(policy.observed_after, null, 2));

    // 4. Ejecutar Turno de Rol (External Orchestration via Bridge)
    console.log(`\n[4] Ejecutando paso de escena para rol '${ROLE_ID}'...`);
    // Usamos 'as' para forzar a Nova
    const execRes = await ops.roleExecuteTurn({ 
        role_id: ROLE_ID, 
        group_id: GROUP_ID, 
        action: 'as' 
    });

    console.log(`Result: ${execRes.ok ? 'SUCCESS' : 'FAIL'}`);
    console.log(`Action: ${execRes.action_taken}`);
    console.log(`Trace:`, JSON.stringify(execRes.observed_after.trace, null, 2));

    if (execRes.ok) {
        console.log(`Bridge Queue size: ${execRes.observed_after.queue_size}`);
        console.log(`\n[VERIFICATION] El comando ha sido encolado en el puente.`);
        console.log(`SillyTavern Frontend procesará el comando '/as ${TARGET_CHAR}' en el próximo poll.`);
    }

    console.log("\n=== DEMO FINALIZADA ===");
}

runDemo();
