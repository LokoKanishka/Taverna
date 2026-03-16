const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function verifyAgentPolicy() {
    const client = new SillyTavernClient();
    const ops = new TavernaOperations(client);

    console.log("=== 1. Test Mutación con Ruta Interna (Pasa) ===");
    const internalActionOk = async () => ({ ok: true, source: 'internal_api_endpoint' });
    const resultOk = await ops._executeWithPolicy('update_settings', internalActionOk, null);
    
    console.log("Resultado:", resultOk);
    console.log(`✓ Política Respetada (Ruta Interna Usada): ${resultOk.used_internal_path === true}`);

    console.log("\n=== 2. Test Mutación SIN Ruta Interna (Bloqueado) ===");
    const internalActionFail = async () => ({ ok: false });
    const subagentFallback = async () => ({ ok: true, source: 'browser_click_ui' });

    ops.policy.emergency_ui_mode = false;

    const resultBlocked = await ops._executeWithPolicy(
        'edit_character_visual',
        internalActionFail,
        subagentFallback
    );

    console.log("Resultado Bloqueo:", resultBlocked);
    console.log(`✓ Política Respetada (Subproceso UI Bloqueado): ${resultBlocked.error === 'unsupported_internal_path'}`);
    
    console.log("\n=== Test de Política Completado ===");
    process.exit(0);
}

verifyAgentPolicy().catch(console.error);
