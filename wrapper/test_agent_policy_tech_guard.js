const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function verifyTechGuard() {
    const client = new SillyTavernClient();
    const ops = new TavernaOperations(client);

    console.log("=== Test de Bloqueo Técnico: characterImport SIN Archivo ===");
    
    // Forzamos modo emergencia apagado (política por defecto)
    ops.policy.emergency_ui_mode = false;

    // Llamamos a la función real que ahora está envuelta
    const result = await ops.characterImport({
        file_path: '/tmp/non_existent_character_file_xyz.png',
        file_type: 'png'
    });

    console.log("Resultado del Wrapper:", result);
    
    const isBlockedSafe = result.error === 'unsupported_internal_path' && result.used_emergency_ui === false;
    console.log(`✓ Bloqueo Técnico Efectivo (Fail-Closed): ${isBlockedSafe}`);
    
    console.log("\n=== Test de Bloqueo Técnico Completado ===");
    process.exit(0);
}

verifyTechGuard().catch(console.error);
