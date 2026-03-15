const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runTest() {
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    console.log("=== 1. Test Caso Interno Feliz (Mockeado) ===");
    // Para no depender de un servidor vivo en el test de políticas
    const dummyInternalOk = async () => ({ ok: true, source: 'internal' });
    const resultOk = await ops._executeWithPolicy(
        'test_operation_ok',
        dummyInternalOk,
        null
    );
    console.log("Resultado Interno:", resultOk);
    console.log(`OK: ${resultOk.ok}, Interno: ${resultOk.used_internal_path}`);

    console.log("\n=== 2. Test _executeWithPolicy (Emergencia OFF) ===");
    // Desactivamos modo emergencia si estuviera activo
    ops.policy.emergency_ui_mode = false;
    
    const dummyInternalFail = async () => ({ ok: false });
    const dummyFallbackUi = async () => ({ ok: true, source: 'ui' });

    const resultOff = await ops._executeWithPolicy(
        'test_operation',
        dummyInternalFail,
        dummyFallbackUi
    );
    console.log("Resultado (Emergencia OFF):", resultOff);
    console.log(`Rechazado correctamente: ${resultOff.error === 'unsupported_internal_path'}`);

    console.log("\n=== 3. Test _executeWithPolicy (Emergencia ON) ===");
    ops.policy.emergency_ui_mode = true;

    const resultOn = await ops._executeWithPolicy(
        'test_operation',
        dummyInternalFail,
        dummyFallbackUi
    );
    console.log("Resultado (Emergencia ON):", resultOn);
    console.log(`Permitido correctamente (Backup UI): ${resultOn.used_emergency_ui === true}`);
    console.log("=== Test Completo ===");
    process.exit(0);
}

runTest().catch(console.error);
