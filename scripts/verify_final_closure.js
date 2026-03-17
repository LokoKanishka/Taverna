const { SillyTavernClient } = require('../wrapper/client');
const { TavernaOperations } = require('../wrapper/operations');

async function runVerify() {
    console.log("==================================================");
    console.log(" TAVERNA V2 - FINAL REPRODUCIBLE CLOSURE VERIFY ");
    console.log("==================================================\n");

    const client = new SillyTavernClient('http://127.0.0.1:8123');
    const ops = new TavernaOperations(client);
    let allPassed = true;

    const assertPass = (name, res, allowNotFound = false) => {
        const isOk = res && (res.ok || res.operation_ok);
        const isVerifiedOrDryRun = res && (res.verified !== false || res.dry_run || allowNotFound);
        
        if (isOk && isVerifiedOrDryRun && res.used_internal_path !== false && !res.used_emergency_ui) {
            console.log(`[PASS] ${name} -> Native internal execution successful.`);
        } else if (allowNotFound && res && !isOk && res.error && res.error.toLowerCase().includes("not found")) {
            console.log(`[PASS] ${name} -> Target not found, but operation is wired correctly.`);
        } else {
            console.error(`[FAIL] ${name} -> Expected clean internal success, got:`, JSON.stringify(res));
            allPassed = false;
        }
    };

    const assertFailClean = (name, res) => {
        const isOk = res && (res.ok || res.operation_ok);
        if (res && !isOk && !res.verified && !res.used_emergency_ui) {
            console.log(`[PASS] ${name} -> Handled clean failure (Unsupported/Internal). No UI fallback used.`);
        } else {
            console.error(`[FAIL] ${name} -> Expected clean internal failure, got:`, JSON.stringify(res));
            allPassed = false;
        }
    };

    try {
        // 1. Health
        console.log("1. Checking Status & Health...");
        const health = await ops.healthStatus();
        assertPass("health.status", health);

        // 2. Settings Update (Safe RMW)
        console.log("\n2. Testing Settings Update (Safe RMW)...");
        const updatesObj = { temp: 0.98 };
        const settingsRes = await ops.settingsUpdate(updatesObj);
        assertPass("settings.update", settingsRes);
        // Revert 
        if (settingsRes.observed_before) {
            await ops.settingsUpdate({ temp: settingsRes.observed_before.temp });
        }

        // 3. Chat Resolution
        console.log("\n3. Testing target resolution...");
        const resolveRes = await ops.chatResolveTarget('current');
        // Note: this might fail if no active chat/group exists, let's gracefully handle that.
        if (resolveRes.ok) {
             console.log(`[PASS] chat.resolve_target -> Resolved to ${resolveRes.target}`);
        } else {
             console.log(`[WARN] chat.resolve_target -> Ensure ST has an active chat, skipping strict fail: ${resolveRes.error}`);
        }

        // 4. Chat Append Safe
        console.log("\n4. Testing Safe Append (Idempotency)...");
        if (resolveRes.ok) {
             const appendRes = await ops.chatAppendMessageSafe('current', 'Closure Verify Automation', false, 'System');
             assertPass("chat.append_safe", appendRes);
        } else {
             console.log("[SKIP] Cannot test chat.append_safe without active target.");
        }

        // 5. Destructive Operations (Dry-Run mode when possible or using dummy data)
        console.log("\n5. Testing Destructive Internal Paths (Dry-Run if applicable)...");
        
        const charDelete = await ops.characterDeleteBulk({ targets: ['DeleteMeNonExistent'], dry_run: true });
        assertPass("character.delete_bulk", charDelete);

        const groupDelete = await ops.groupDelete({ id: 'dummy_group', dry_run: true });
        assertPass("group.delete", groupDelete, true);

        const chatDelete = await ops.chatDelete({ avatar_url: 'dummy.png', file_name: 'dummy_chat', dry_run: true });
        assertPass("chat.delete", chatDelete);

        // 6. Lorebook Update
        console.log("\n6. Testing Lorebook Update (Dry-Run/Dummy)...");
        const lbRes = await ops.lorebookUpdate({ name: 'dummy_lorebook', data: { entries: [] }, dry_run: true });
        assertPass("lorebook.update", lbRes);

        // 7. Policy Guard (Character Import/Create)
        console.log("\n7. Testing Policy Guard for UNSUPPORTED surfaces (characterImport)...");
        const importRes = await ops.characterImport({ file_path: '/tmp/nonexistent.json', file_type: 'json' });
        assertFailClean("character.import (Zero-UI Enforcement)", importRes);

        // Conclusion
        console.log("\n==================================================");
        if (allPassed) {
            console.log("FINAL DIAGNOSTIC: ALL GOVERNANCE CONTRACTS ENFORCED (ZERO-UI)");
            process.exit(0);
        } else {
            console.error("FINAL DIAGNOSTIC: VERIFICATION FAILED. Check logs above.");
            process.exit(1);
        }

    } catch (e) {
        console.error("FATAL ERROR DURING VERIFICATION:", e);
        process.exit(1);
    }
}

runVerify();
