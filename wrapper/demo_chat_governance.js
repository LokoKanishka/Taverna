const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');
const { NLResolver } = require('./resolver');

async function main() {
    console.log("==========================================");
    console.log(" TAVERNA TOTAL CONTROL - CHAT GOVERNANCE  ");
    console.log(" PHASE 8C DEMOSTRATION                    ");
    console.log("==========================================\n");

    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);
    const resolver = new NLResolver(ops);

    const check = await ops.healthStatus();
    if (!check.operation_ok) {
        console.error("❌ SillyTavern API is not accessible. Aborting.");
        process.exit(1);
    }

    async function executeDemo(num, text) {
        console.log(`\n▶️  DEMO ${num} NLP INPUT: "${text}"`);
        const result = await resolver.process(text);
        
        console.log(`[OK]                    => ${result.ok}`);
        console.log(`[OPERATION]             => ${result.mapped_operation}`);
        if (result.target) {
             console.log(`[TARGET]                => ${result.target}`);
             console.log(`[TARGET_CONFIDENCE]     => ${result.target_confidence}`);
             console.log(`[RESOLUTION_BASIS]      => ${result.resolution_basis}`);
        }
        if (result.action_taken) console.log(`[ACTION]                => ${result.action_taken}`);
        
        if (result.mapped_operation === 'chat.read_tail' && result.observed_after) {
             console.log(`[MESSAGES_COUNT]        => ${result.observed_after.total_items}`);
             console.log(`[TAIL_PREVIEW]          => ${JSON.stringify(result.observed_after.messages[result.observed_after.messages.length-1].mes).substring(0, 50)}...`);
        } else if (result.mapped_operation === 'chat.list_recent' && result.observed_after) {
             const names = result.observed_after.slice(0, 3).map(c => c.avatar || c.group).join(', ');
             console.log(`[OBSERVED_AFTER]        => Array of ${result.observed_after.length} chats. Top 3: [ ${names} ]`);
        } else if (result.observed_after && !result.observed_after.messages) {
             console.log(`[OBSERVED_AFTER]        => ${JSON.stringify(result.observed_after)}`);
        }

        console.log(`[DUPLICATION_DETECTED]  => ${result.duplication_detected || false}`);
        console.log(`[ROLLBACK_SUPPORTED]    => ${result.rollback_supported || false}`);
        if (result.rollback_attempted) {
             console.log(`[ROLLBACK_ATTEMPTED]    => ${result.rollback_attempted}`);
             console.log(`[ROLLBACK_OK]           => ${result.rollback_ok}`);
        }
        if (result.error) console.log(`[ERROR]                 => ${result.error}`);
        
        return result;
    }

    // 1. Listar chats recientes
    await executeDemo(1, "listame los chats recientes");

    // 2. Resolver candidate actual con evidencia
    await executeDemo(2, "mostrame el chat actual");

    // 3. Leer últimos N mensajes de un chat
    await executeDemo(3, "leé los últimos 2 mensajes del chat actual");

    // 4. Inyectar mensaje en un chat explícitamente identificado
    await executeDemo(4, "inyectá este mensaje en el chat actual: *Una sirena comienza a sonar a lo lejos, cortando la tensión del callejón.*");

    // 5. Verificar la inyección
    console.log(`\n▶️  DEMO 5: VERIFICANDO INYECCIÓN MANUALMENTE`);
    const readAfterInject = await executeDemo(5, "leé los últimos 1 mensajes del chat actual");
    const tailMsg = readAfterInject.observed_after.messages[0];
    if (tailMsg.extra && tailMsg.extra.antigravity_token) {
         console.log(`[VERIFICACIÓN]          => EXITOSA. El token está presente: ${tailMsg.extra.antigravity_token}`);
    } else {
         console.log(`[VERIFICACIÓN]          => FALLIDA. No se encontró el token de Antigravity.`);
    }

    // 6. Caso ambiguo con rechazo controlado (e.g., target inexistente)
    await executeDemo(6, "mostrame el chat de UnPersonajeQueNoExiste");

    // 7. Caso de retry/idempotencia sin duplicación
    await executeDemo(7, "inyectá este mensaje en el chat actual: *Una sirena comienza a sonar a lo lejos, cortando la tensión del callejón.*");

    console.log("\n==========================================");
    console.log(" DONE.");
    console.log("==========================================\n");
}

main().catch(console.error);
