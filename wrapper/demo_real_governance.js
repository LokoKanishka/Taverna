const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');
const { NLResolver } = require('./resolver');

async function runRealGovernanceDemos() {
    console.log("==========================================================");
    console.log("   TAVERNA-V2: REAL GOVERNANCE DEMONSTRATION (PHASE 7)   ");
    console.log("==========================================================\n");

    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);
    const resolver = new NLResolver(ops);

    const healthCheck = await ops.healthStatus();
    
    if (!healthCheck.operation_ok) {
         console.error("FATAL: SillyTavern is not reachable on 127.0.0.1:8123.");
         process.exit(1);
    }
    console.log("[SYSTEM] SillyTavern runtime verified reachable.\n");

    // Utilities
    const executeDemo = async (num, intentText, isSimulation = false) => {
         console.log(`\n\n--- DEMO #${num}: NL INSTRUCTION ---`);
         console.log(`User Request: "${intentText}"`);
         
         if (isSimulation) console.log(`[!] SIMULATING BACKEND FAILURE DEEP IN ST TO TRIGGER AUTO-ROLLBACK`);

         // Dispatch execution
         let result = await resolver.process(intentText);
         
         if (result.error && !result.mapped_operation) {
              console.log(`[ERROR] Parsing failed: ${result.error}`);
              return;
         }
         
         console.log(`\n> Resolved Intent: ${result.resolved_intent} | Args: ${JSON.stringify(result.arguments)}`);
         
         // Emulate the clean NL final output
         console.log(`\n> EXECUTION RESULTS:`);
         console.log(`  Operation Mapped : ${result.mapped_operation} (${result.action_taken})`);
         console.log(`  Operation OK     : ${result.ok}`);    // the actual structure uses 'ok' inherited from resolver logic which needs adapting
         console.log(`  Target Verified  : ${result.verified}`);
         
         // We must manually inspect ops result inside the real object if we want rollback data
         // because resolver.process mapped some but omitted rollback info natively.
         // Wait, the result *is* the merged output in resolver.js (lines 151-158). Let's just dump it if missing keys.
         
         if (result.rollback_attempted !== undefined) {
             if (result.rollback_attempted) {
                  console.log(`  \n  [ATTENTION: ROLLBACK ENGAGED]`);
                  console.log(`  Rollback Success  : ${result.rollback_ok}`);
                  console.log(`  Rollback Result   : ${result.rollback_result_raw}`);
                  console.log(`  Final State Safed : ${result.final_state_restored}`);
             } else {
                  console.log(`  Rollback Attempt : false`);
             }
         }

         if (result.error) {
              console.log(`  Observed Error   : ${result.error}`);
         }
         
         console.log(`\n  Observed Before  : ${JSON.stringify(result.observed_before).slice(0, 100)}...`);
         console.log(`  Observed After   : ${JSON.stringify(result.observed_after).slice(0, 100)}...`);
    };

    /**
     * DEMO 1: HEALTH
     */
    console.log(">> STARTING DEMO 1");
    await executeDemo(1, "Decime si Taverna/SillyTavern está sano");
    console.log(">> FINISHED DEMO 1");

    /**
     * DEMO 2: MODEL MUTATE
     */
    console.log(">> STARTING DEMO 2");
    const models = await ops.modelList();
    const activeBefore = await ops.modelGetActive();
    await executeDemo(2, "cambiá al modelo kobold test-model");
    
    // Clean up to original
    await ops.modelSetActive(activeBefore.observed_after.api, activeBefore.observed_after.model);
    console.log(">> FINISHED DEMO 2");

    /**
     * DEMO 3: CHARACTER MUTATE
     */
    console.log(">> STARTING DEMO 3");
    const charList = await client.post('/api/characters/all');
    let charTarget = charList.data.find(c => c.avatar === 'Director de Juego.png'); // specific small character
    if (!charTarget) charTarget = charList.data?.[0];

    if (charTarget) {
         await executeDemo(3, `agregale al personaje ${charTarget.avatar} este rasgo: Modificado por PNL de Antigravity`);
         // Clean up character
         const originalDesc = charTarget.description;
         await ops.characterUpdateFields({ avatar: charTarget.avatar, ch_name: charTarget.name, description: originalDesc });
    } else {
         console.log("Skipping Demo 3: No characters available.");
    }
    console.log(">> FINISHED DEMO 3");

    /**
     * DEMO 4: LOREBOOK MUTATE
     */
    console.log(">> STARTING DEMO 4");
    const lbList = await ops.lorebookList();
    const lbTarget = lbList.observed_after?.[0];
    if (lbTarget) {
         await executeDemo(4, `creá una entrada en el lorebook ${lbTarget} con la clave magic-door y el contenido This is a magic door`);
    } else {
         console.log("Skipping Demo 4: No Lorebooks available.");
    }
    console.log(">> FINISHED DEMO 4");

    /**
     * DEMO 5: SETTINGS MUTATE
     */
    console.log(">> STARTING DEMO 5");
    const sets = await ops.settingsRead();
    const origDarkState = sets.observed_after.public_api;
    await executeDemo(5, `cambiá la setting public_api a ${!origDarkState}`);
    // Cleanup
    await ops.settingsUpdate({ public_api: !!origDarkState });
    console.log(">> FINISHED DEMO 5");

    /**
     * DEMO 6: FORCED ROLLBACK VIA SIMULATION (Settings mutate that mismatches)
     */
    console.log(">> STARTING DEMO 6");
    const originalPost = client.post.bind(client);
    client.post = async function(route, payload) {
         if (route === '/api/settings/save' && payload && payload.temp === 1.5) {
             // Simulate backend totally ignoring that property
             return { success: true, status: 200, data: { success: true } };
         }
         return await originalPost(route, payload);
    };

    await executeDemo(6, `cambiá la setting temp a 1.5`, true);

    client.post = originalPost;
    console.log(">> FINISHED DEMO 6");

    console.log("\n==========================================================");
    console.log("   DEMONSTRATION COMPLETE                                   ");
    console.log("==========================================================");

}

runRealGovernanceDemos();
