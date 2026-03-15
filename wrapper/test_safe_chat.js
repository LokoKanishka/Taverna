const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runTest() {
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    console.log('--- PHASE 18: SAFE CHAT GOVERNANCE TEST ---');

    try {
        // 1. Resolve Target (Current)
        console.log('\nSTEP 1: Resolving current target...');
        const targetRes = await ops.chatResolveTarget('current');
        console.log(`Resolved to: ${targetRes.target} (Confidence: ${targetRes.target_confidence})`);
        console.log(`Basis: ${targetRes.resolution_basis}`);

        if (!targetRes.ok) throw new Error('Target resolution failed');

        // 2. Safe Append Message
        const testMessage = `Safe Governance Test at ${new Date().toISOString()}`;
        console.log(`\nSTEP 2: Appending safe message: "${testMessage}"`);
        
        const appendRes = await ops.chatAppendMessageSafe('current', testMessage, false, 'Taverna-V2-Tester');
        
        if (appendRes.ok && appendRes.verified) {
            console.log('SUCCESS: Message appended and verified via RMW pattern.');
            console.log(`Before count: ${appendRes.observed_before.count}`);
            console.log(`After count: ${appendRes.observed_after.count}`);
            console.log(`Token: ${appendRes.observed_after.token}`);
        } else {
            console.error('FAILURE: Append failed or verification failed.');
            console.error(JSON.stringify(appendRes, null, 2));
        }

        // 3. Test Ambiguity (Negative Case)
        console.log('\nSTEP 3: Testing ambiguity handling...');
        // We assume 'a' might match multiple characters if they exist
        const ambigRes = await ops.chatResolveTarget('a'); 
        if (!ambigRes.ok && ambigRes.error === 'Ambiguous target resolution') {
            console.log('PASS: Successfully rejected ambiguous target.');
            console.log(`Candidates: ${ambigRes.candidates.join(', ')}`);
        } else {
            console.log('INFO: Target "a" was not ambiguous in this state or resolution failed differently.');
            console.log(JSON.stringify(ambigRes, null, 2));
        }

        // 4. Verify Identity-based selection (Exact)
        console.log('\nSTEP 4: Testing exact target resolution...');
        // Use the resolved target name from Step 1 for exact match
        const exactRes = await ops.chatResolveTarget(targetRes.target);
        if (exactRes.ok && exactRes.target_confidence === 1.0) {
            console.log(`PASS: Exact match confirmed for "${targetRes.target}" with confidence 1.0`);
        } else {
            console.error('FAIL: Exact match failed or had low confidence.');
            console.error(JSON.stringify(exactRes, null, 2));
        }

    } catch (err) {
        console.error('UNEXPECTED ERROR during test:', err);
    }
}

runTest();
