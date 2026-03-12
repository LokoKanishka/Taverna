const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');
const fs = require('fs');

async function runPilotScenario() {
    console.log("=== INICIANDO SESIÓN PILOTO: ESCENARIO REAL (PHASE 16) ===\n");
    
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);
    const GROUP_ID = "1772677610950"; // Grupo de prueba real
    const TRACE_FILE = "/home/lucy-ubuntu/Escritorio/Taverna-v2/docs/PILOT_SCENARIO_TRACE.json";

    const scenarioTrace = [];

    try {
        // TURN 1: Setup Escena (Master)
        console.log("Turn 1: Setup de Escena (Master)");
        const t1 = await ops.sceneStateUpdate(GROUP_ID, { location: "Pilot Hangar", status: "Pre-flight check" });
        scenarioTrace.push({ turn: 1, role: "master", state: t1.observed_after });

        // TURN 2: Acción de Personaje + Escritura en Memoria
        console.log("Turn 2: Acción de Personaje (Character)");
        await ops.memoryWrite('character', GROUP_ID, { entry: "Character is nervous about the flight" }, "Initial character state");
        const t2 = await ops.roleExecuteTurn('character', GROUP_ID, "Checking the fuel gauges.");
        scenarioTrace.push({ turn: 2, role: "character", action: "Execute", memory_write: true });

        // TURN 3: Intervención del Narrador
        console.log("Turn 3: Reacción del Entorno (Narrator)");
        const t3 = await ops.roleExecuteTurn('narrator', GROUP_ID, "The lights flicker as the engine coughs.");
        scenarioTrace.push({ turn: 3, role: "narrator", action: "Execute" });

        // TURN 4: Mutación en Caliente (System Update)
        console.log("Turn 4: Mutación en Caliente (Config change)");
        await ops.sceneStateUpdate(GROUP_ID, { status: "Engine Failure" });
        // Simular cambio de preset/modelo para el Master
        await ops.modelSetActive('openai', 'gpt-3.5-turbo'); // Fallback mode
        scenarioTrace.push({ turn: 4, role: "system", mutation: "Model switch & Status Change" });

        // TURN 5: Resolución (Master)
        console.log("Turn 5: Resolución (Master)");
        const t5 = await ops.roleExecuteTurn('master', GROUP_ID, "Emergency procedures initiated.");
        scenarioTrace.push({ turn: 5, role: "master", state: "Emergency" });

        fs.writeFileSync(TRACE_FILE, JSON.stringify(scenarioTrace, null, 2));
        console.log(`\nSesión piloto completada. Traza guardada en ${TRACE_FILE}`);

    } catch (error) {
        console.error("ERROR EN EL PILOTO:", error);
    }
}

runPilotScenario();
