const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');
const { NLResolver } = require('./resolver');

async function runNLDemo() {
    console.log("=== INICIANDO DEMO DE LENGUAJE NATURAL (FASE 5) ===\n");
    
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);
    const resolver = new NLResolver(ops);

    const inputs = [
        "decime si taverna está sano",
        "qué modelo está activo",
        "listame los modelos",
        "cambiá al modelo kobold test-nlp-model",
        "mostrame el personaje Byte.png",
        "agregale al personaje Byte.png este rasgo: nlp-injected-trait",
        "listame los lorebooks",
        "creá una entrada en el lorebook 0 con la clave nlp-test y el contenido injected via natural language",
        "decime el valor de la setting public_api",
        "cambiá la setting public_api a true",
        "hacé algo destructivo que borre todo" // Debería fallar controladamente
    ];

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        console.log(`\n[Input ${i+1}] "${input}"`);
        const result = await resolver.process(input);
        
        console.log(`  -> Intent: ${result.resolved_intent}`);
        console.log(`  -> Operation: ${result.mapped_operation || 'None'}`);
        console.log(`  -> Args: ${JSON.stringify(result.arguments)}`);
        
        if (result.ok) {
            console.log(`  -> Result: PASS (Verified: ${result.verified})`);
            if (result.resolved_intent === 'settings_read') {
                 console.log(`  -> Output Value:`, result.observed_after);
            }
        } else {
            console.log(`  -> Result: FAIL`);
            console.log(`  -> Error: ${result.error || 'Unknown error'}`);
        }
    }

    // Rollback changes
    console.log("\n--- Executing Rollback ---");
    await ops.modelSetActive(undefined, undefined); // or whatever they were before
    await ops.settingsUpdate({ public_api: false });

    console.log("\n=== DEMO NLP COMPLETADA ===");
}

runNLDemo();
