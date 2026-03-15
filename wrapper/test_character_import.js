const { SillyTavernClient } = require('./client');
const { TavernaOperations } = require('./operations');

async function runTest() {
    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);

    console.log('--- TEST: CREATE/IMPORT CHARACTER (NO UI) ---');

    try {
        const testFilePath = '/tmp/test_char.png';
        const fileType = 'png';

        console.log(`\nSTEP 1: Importing character from ${testFilePath}...`);
        
        const importRes = await ops.characterImport({
            file_path: testFilePath,
            file_type: fileType
        });

        console.log('\nRESULT:');
        console.log(JSON.stringify(importRes, null, 2));

        if (importRes.ok && importRes.verified) {
            console.log('\nSUCCESS: Character imported and verified via internal API.');
            console.log(`Assigned File Name: ${importRes.file_name}`);
        } else {
            console.error('\nFAILURE: Import failed or verification failed.');
            process.exit(1);
        }

    } catch (err) {
        console.error('\nUNEXPECTED ERROR during test:', err);
        process.exit(1);
    }
}

runTest();
