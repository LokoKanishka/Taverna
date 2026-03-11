const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function ensureST() {
     const client = new SillyTavernClient('http://127.0.0.1:8123');
     const ops = new TavernaOperations(client);
     const res = await ops.healthStatus();
     if (!res.ok) {
          console.error("SillyTavern must be running on 127.0.0.1:8123 to execute rollback demos.");
          process.exit(1);
     }
     return { client, ops };
}

async function runRollbackDemos() {
     console.log("=== INICIANDO VALIDACIÓN DE AUTO-ROLLBACK (FASE 6) ===\n");
     const { client, ops } = await ensureST();

     /**
      * 1. SETTINGS.UPDATE
      */
     console.log("\n--- TEST 1: SETTINGS ROLLBACK ---");
     // Setup: set public_api explicitly so we know the before-state
     await ops.settingsUpdate({ public_api: false });

     // Case A: Success
     console.log("Test 1A: Success Case");
     let sRes1 = await ops.settingsUpdate({ public_api: true });
     console.log(`PASS? ${sRes1.verified} | Attempted Rollback? ${sRes1.rollback_attempted}`);

     // Clean up
     await ops.settingsUpdate({ public_api: false });

     // Case B: Forced Failure 
     // We patch the post method temporarily to simulate the backend ignoring the save
     console.log("Test 1B: Forced Mismatch Case");
     
     const originalPost = client.post.bind(client);
     client.post = async function(route, payload) {
          if (route === '/api/settings/save' && payload && payload.public_api === true) {
              // Simulate SILENT failure by returning success but NOT actually changing it (simulating backend ignores it)
              // Wait, ST just saves whatever we POST. Let's intercept the read instead to simulate mismatch.
              return { success: true };
          }
          return await originalPost(route, payload);
     };

     // The verify step will read from the REAL ST (which is false, since our mock POST didn't actually hit ST)
     // Thus the verified flag will fail, triggering rollback.
     let sRes2 = await ops.settingsUpdate({ public_api: true });
     console.log(`PASS? ${sRes2.verified === false} (Expected False)`);
     console.log(`Attempted Rollback? ${sRes2.rollback_attempted} (Expected True)`);
     console.log(`Rollback Result: ${sRes2.rollback_result}`);
     console.log(`Observed Error: ${sRes2.error}`);
     
     // Restore the client
     client.post = originalPost;


     /**
      * 2. MODEL.SET_ACTIVE
      */
     console.log("\n--- TEST 2: MODEL SET ACTIVE ROLLBACK ---");
     // Get true state
     const mState = await ops.modelGetActive();

     console.log("Test 2A: Success Case");
     let mRes1 = await ops.modelSetActive('kobold', 'model-test-rollback');
     console.log(`PASS? ${mRes1.verified} | Attempted Rollback? ${mRes1.rollback_attempted}`);
     
     // Restore organically (just in case)
     await ops.modelSetActive(mState.observed_after.api, mState.observed_after.model);

     console.log("Test 2B: API Failure Case");
     // Simulate API throwing HTTP 500 when setting the model
     client.post = async function(route, payload) {
          if (route === '/api/settings/save' && payload && payload.api_server_default === 'fake_api_fail') {
              return { success: false, error: 'Simulated 500 API Error' };
          }
          return await originalPost(route, payload);
     };

     let mRes2 = await ops.modelSetActive('fake_api_fail', 'fake_model');
     console.log(`PASS? ${mRes2.verified === false} (Expected False)`);
     console.log(`Attempted Rollback? ${mRes2.rollback_attempted} (Expected True)`);
     console.log(`Rollback Result: ${mRes2.rollback_result}`);
     
     client.post = originalPost;

     /**
      * 3. CHARACTER.UPDATE_FIELDS
      */
     console.log("\n--- TEST 3: CHARACTER UPDATE ROLLBACK ---");
     const charList = await client.post('/api/characters/all');
     const charName = charList.data[0]?.avatar;

     if (!charName) {
         console.log("Skipping character tests - no characters found.");
     } else {
         console.log(`Test 3A: Success Case (${charName})`);
         const oChar = await ops.characterRead(charName);
         
         const cRes1 = await ops.characterUpdateFields({ avatar: charName, ch_name: oChar.observed_after.name, description: 'Test Update Success' });
         console.log(`PASS? ${cRes1.verified} | Attempted Rollback? ${cRes1.rollback_attempted}`);
         // cleanup naturally
         await ops.characterUpdateFields({ avatar: charName, ch_name: oChar.observed_after.name, description: oChar.observed_after.description });

         console.log(`Test 3B: Forced Mismatch Case`);
         // We intercept the verification read to return the old data, tricking the wrapper into a mismatch
         const originalCharRead = ops.characterRead.bind(ops);
         let fakeReads = 0;
         ops.characterRead = async function(avatar) {
              const r = await originalCharRead(avatar);
              if (fakeReads === 1) { // Force the verification read to look exactly like the first read
                   r.observed_after.description = 'Totally Unrelated Fake String';
              }
              fakeReads++;
              return r;
         };

         const cRes2 = await ops.characterUpdateFields({ avatar: charName, ch_name: oChar.observed_after.name, description: 'Test Update Fallback' });
         console.log(`PASS? ${cRes2.verified === false} (Expected False)`);
         console.log(`Attempted Rollback? ${cRes2.rollback_attempted} (Expected True)`);
         console.log(`Rollback Result: ${cRes2.rollback_result}`);
         
         ops.characterRead = originalCharRead;
     }

     /**
      * 4. LOREBOOK.UPSERT_ENTRY
      */
     console.log("\n--- TEST 4: LOREBOOK UPSERT ROLLBACK ---");
     const lbList = await ops.lorebookList();
     const lbName = lbList.observed_after?.[0];

     if (!lbName) {
         console.log("Skipping lorebook tests - no lorebooks found.");
     } else {
         console.log(`Test 4A: Success Case (${lbName})`);
         const lRes1 = await ops.lorebookUpsertEntry({ lorebook_name: lbName, keyword: 'rollback-test-key', content: 'rollback content' });
         console.log(`PASS? ${lRes1.verified} | Attempted Rollback? ${lRes1.rollback_attempted}`);

         // We won't strictly clean this up natively unless we want to delete it. Upsert is safe enough.

         console.log(`Test 4B: API Failure Case`);
         client.post = async function(route, payload) {
              if (route === '/api/worldinfo/edit' && payload.data.entries) {
                  // If it contains our injected fake key, reject the API call
                  const fakeKeyExists = Object.keys(payload.data.entries).some(k => payload.data.entries[k].key.includes('fake-rollback-key'));
                  if (fakeKeyExists) {
                      return { success: false, error: 'Simulated rejection of massive payload' };
                  }
              }
              return await originalPost(route, payload);
         };

         const lRes2 = await ops.lorebookUpsertEntry({ lorebook_name: lbName, keyword: 'fake-rollback-key', content: 'fake rollback content' });
         console.log(`PASS? ${lRes2.verified === false} (Expected False)`);
         console.log(`Attempted Rollback? ${lRes2.rollback_attempted} (Expected True)`);
         console.log(`Rollback Result: ${lRes2.rollback_result}`);
         
         client.post = originalPost;
     }

     console.log("\n=== VALIDACIÓN DE ROLLBACK COMPLETADA ===");
}

runRollbackDemos();
