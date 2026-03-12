const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runSceneContinuityDemo() {
    console.log("=== INICIANDO DEMO: SCENE CONTINUITY & TRACEABILITY (PHASE 11D) ===\n");
    
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    const GROUP_ID = "1772677610950"; // Cyberpunk group
    const MASTER = "master";
    const CHAR = "character";
    const NARRATOR = "narrator";

    const turns = [];

    async function recordTurn(index, role, action, result) {
        const snap = await ops.contextSnapshot(GROUP_ID, role);
        const data = snap.observed_after;
        
        const turnData = {
            turn_index: index,
            role: role,
            action_taken: action,
            state_before: data.state,
            context_sources: data.policy,
            persistent_memory: await ops.memorySnapshot(),
            verified: result.ok
        };
        turns.push(turnData);
        console.log(`[Turno ${index}] Rol: ${role} | Resultado: ${result.ok ? 'OK' : 'FAIL'}`);
        return turnData;
    }

    // --- TURNO 1: MASTER (Setup) ---
    console.log("\n--- Turno 1: Master establece escenario ---");
    await ops.sceneStateUpdate(GROUP_ID, { 
        location: "Underground Clinic", 
        security_level: "High",
        objective: "Retrieve data chip"
    });
    const res1 = await ops.roleExecuteTurn({ role_id: MASTER, group_id: GROUP_ID, action: 'gen' });
    await recordTurn(1, MASTER, "Set initial state and trigger /gen", res1);

    // --- TURNO 2: CHARACTER (Acción con Memoria) ---
    console.log("\n--- Turno 2: Character actúa y persiste memoria ---");
    // Simulamos que el personaje guarda algo en su memoria persistente
    await ops.memoryWrite('character', 'default', { 
        last_thought: "The Master is watching me.", 
        trust_level: 0.2 
    }, "Character suspicion update");

    const res2 = await ops.roleExecuteTurn({ role_id: CHAR, group_id: GROUP_ID, action: 'as' });
    await recordTurn(2, CHAR, "Memory write and trigger /as", res2);

    // --- TURNO 3: NARRATOR (Reacción) ---
    console.log("\n--- Turno 3: Narrator reacciona al estado ---");
    const res3 = await ops.roleExecuteTurn({ role_id: NARRATOR, group_id: GROUP_ID, action: 'gen' });
    await recordTurn(3, NARRATOR, "Trigger /gen", res3);

    // --- TURNO 4: ACTUALIZACIÓN DE ESTADO ---
    console.log("\n--- Turno 4: Evolución del estado de la escena ---");
    await ops.sceneStateUpdate(GROUP_ID, { 
        security_level: "Alerted", 
        last_event: "Alarm triggered by hack" 
    });
    const res4 = await ops.roleExecuteTurn({ role_id: MASTER, group_id: GROUP_ID, action: 'gen' });
    const turn4 = await recordTurn(4, MASTER, "State update (Alerted) and /gen", res4);

    // --- CASO NEGATIVO: Degración Limpia ---
    console.log("\n--- Turno 5: Caso Negativo (Rol Inválido) ---");
    const res5 = await ops.roleExecuteTurn({ role_id: "ghost_role", group_id: GROUP_ID });
    console.log(`[Turno 5] Ghost Role Resultado: ${res5.ok} (Esperado: false o degradado)`);
    console.log("Error reportado:", res5.error || "None");

    // --- RESULTADO FINAL ---
    console.log("\n=== RESUMEN DE CONTINUIDAD ===");
    turns.forEach(t => {
        console.log(`T${t.turn_index} [${t.role}]: State Loc: ${t.state_before.location || 'N/A'}`);
    });

    const finalSnap = await ops.memorySnapshot('character');
    console.log("\nMemoria Persistente Final (Character):", JSON.stringify(finalSnap.observed_after.default, null, 2));
    
    // Guardar evidencia en archivo para el walkthrough
    const fs = require('fs');
    fs.writeFileSync('/home/lucy-ubuntu/Escritorio/Taverna-v2/docs/CONTUINITY_TRACE.json', JSON.stringify(turns, null, 2));
}

runSceneContinuityDemo().catch(err => {
    console.error("DEMO FAILED:", err);
});
