const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function testOperations() {
    console.log("=== INICIANDO VALIDACIÓN DE TAVERNA-V2 ORCHESTRATOR ===\n");
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    // 0. HEALTH
    let hRes = await ops.healthStatus();
    console.log(`[0] Health Status: ${hRes.verified ? 'PASS' : 'FAIL'}`);
    if (!hRes.verified) {
         console.error("SillyTavern no responde, abortando tests.", hRes.error);
         return;
    }

    // 1. LEER MODELO ACTIVO
    const modelActiveObj = await ops.modelGetActive();
    console.log(`[1] Leer Modelo Activo: ${modelActiveObj.verified ? 'PASS' : 'FAIL'}`);
    console.log(`    API: ${modelActiveObj.observed_after?.api}, Model: ${modelActiveObj.observed_after?.model}`);

    // 2. CAMBIAR MODELO ACTIVO
    const orgApi = modelActiveObj.observed_after.api;
    const orgModel = modelActiveObj.observed_after.model;
    const modelSetObj = await ops.modelSetActive('kobold', 'test-model-antigravity');
    console.log(`[2] Cambiar Modelo Activo (kobold): ${modelSetObj.verified ? 'PASS' : 'FAIL'}`);
    // Rollback
    await ops.modelSetActive(orgApi, orgModel);

    // 3. LEER UN PERSONAJE (buscamos listado primero)
    const listRes = await client.post('/api/characters/all');
    if (!listRes.success || !listRes.data.length) {
         console.error("No hay personajes para probar.");
    } else {
         const targetChar = listRes.data[0].avatar;
         console.log(`[+] Personaje objetivo: ${targetChar}`);

         const charReadObj = await ops.characterRead(targetChar);
         console.log(`[3] Leer Personaje: ${charReadObj.verified ? 'PASS' : 'FAIL'}`);

         // 4. EDITAR CAMPO TEXTUAL 
         const orgDesc = charReadObj.observed_after.description;
         const editObj = await ops.characterUpdateFields({ avatar: targetChar, ch_name: charReadObj.observed_after.name, description: 'Antigravity Injected test text.' });
         console.log(`[4] Editar Personaje (description): ${editObj.verified ? 'PASS' : 'FAIL'}`, editObj.error || '');
         // Rollback
         await ops.characterUpdateFields({ avatar: targetChar, ch_name: charReadObj.observed_after.name, description: orgDesc });
    }

    // 5. LEER CHAT ACTUAL
    // Asumimos que hay un recent chat
    let chatTarget = listRes.data[0].name; // Intentar nombre del pj
    if (listRes.data.length > 1) chatTarget = listRes.data[1].name;

    const chatRes = await ops.chatCurrent(chatTarget);
    console.log(`[5] Leer Chat (${chatTarget}): ${chatRes.verified ? 'PASS' : 'FAIL'}`);
    if (!chatRes.verified) console.log("    Aviso:", chatRes.error);

    // 6. INYECTAR MENSAJE
    if (chatRes.verified) {
         const injectRes = await ops.chatInject({ character_name: chatTarget, message_text: "System: Testing Antigravity Insertion", is_user: false });
         console.log(`[6] Inyectar Mensaje: ${injectRes.verified ? 'PASS' : 'FAIL'}`);
    }

    // 7. LISTAR LOREBOOKS
    const lbList = await ops.lorebookList();
    console.log(`[7] Listar Lorebooks: ${lbList.verified ? 'PASS' : 'FAIL'}`);

    if (lbList.observed_after && lbList.observed_after.length > 0) {
        const lbName = lbList.observed_after[0];
        
        // 8. CREAR/MODIFICAR LOREBOOK
        const upsertObj = await ops.lorebookUpsertEntry({ lorebook_name: lbName, keyword: 'antigravity_test', content: 'Testing entry.' });
        console.log(`[8] Modificar Lorebook (${lbName}): ${upsertObj.verified ? 'PASS' : 'FAIL'}`);
    } else {
        console.log(`[8] Modificar Lorebook: SKIP (No lorebooks available)`);
    }

    // 9. LEER SETTING
    const setRead = await ops.settingsRead();
    console.log(`[9] Leer Setting (public_api): ${setRead.verified ? 'PASS' : 'FAIL'}`);

    // 10. CAMBIAR SETTING SEGURA
    const orgPublic = !!setRead.observed_after.public_api; 
    const updateRes = await ops.settingsUpdate({ public_api: !orgPublic });
    console.log(`[10] Cambiar Setting ('public_api'): ${updateRes.verified ? 'PASS' : 'FAIL'}`, updateRes.error || '');
    // Rollback
    await ops.settingsUpdate({ public_api: orgPublic });

    console.log("\n=== PRUEBAS MVP COMPLETADAS ===");
}

testOperations();
