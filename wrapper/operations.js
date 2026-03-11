const { Schemas } = require('./schema');

/**
 * Taverna Operations
 * Implements the explicit REST API contracts to control SillyTavern safely.
 */
class TavernaOperations {
    constructor(client) {
        this.client = client;
    }

    /**
     * Standardized response builder
     */
    _buildResult(name, before, after, action, isOk, error = null, rollbackPlan = null, rollbackAttempted = false, rollbackResult = null) {
        return {
            ok: isOk,
            operation: name,
            observed_before: before,
            action_taken: action,
            observed_after: after,
            verified: isOk && !error,
            rollback_plan: rollbackPlan,
            rollback_attempted: rollbackAttempted,
            rollback_result: rollbackResult,
            error: error
        };
    }

    // ==========================================
    // SYSTEM & RUNTIME P0
    // ==========================================

    async healthStatus() {
        const res = await this.client.post('/api/plugins/st-orchestrator/probe');
        const isOk = res.success && res.status === 204;
        return this._buildResult('health.status', null, isOk ? 'alive' : 'dead', 'ping_probe', isOk, res.error);
    }

    async runtimeStatus() {
        const res = await this.client.get('/api/plugins/st-orchestrator/state');
        const isOk = res.success;
        return this._buildResult('runtime.status', null, res.data, 'get_state', isOk, res.error);
    }

    // ==========================================
    // SETTINGS P0
    // ==========================================

    async settingsRead() {
        const res = await this.client.post('/api/settings/get');
        if (!res.success) throw new Error('Failed to read settings');
        
        // Settings are stored as a JSON string inside res.data.settings
        const parsedSettings = JSON.parse(res.data.settings || '{}');
        return this._buildResult('settings.read', null, parsedSettings, 'read', true);
    }

    async settingsUpdate(updatesDict) {
        const validatedUpdates = Schemas.settingsUpdate(updatesDict);
        
        // 1. Read existing settings
        const beforeRes = await this.settingsRead();
        const existingSettings = beforeRes.observed_after;

        // 2. Apply updates
        const newSettings = { ...existingSettings, ...validatedUpdates };
        const rollbackPlan = `Restore specific keys (${Object.keys(validatedUpdates).join(', ')}) to their values from observed_before`;
        
        // 3. Write back
        const saveRes = await this.client.post('/api/settings/save', newSettings);
        if (!saveRes.success) {
            // Rollback if the REST call itself threw (unlikely but possible)
            const rbRes = await this.client.post('/api/settings/save', existingSettings);
            return this._buildResult('settings.update', existingSettings, null, 'update', false, saveRes.error, rollbackPlan, true, rbRes.success ? 'Success' : 'Failed: ' + rbRes.error);
        }

        // 4. Verify
        const afterRes = await this.settingsRead();
        const isVerified = Object.keys(validatedUpdates).every(k => afterRes.observed_after[k] === validatedUpdates[k]);

        if (!isVerified) {
             // Rollback due to mismatch
             const rbRes = await this.client.post('/api/settings/save', existingSettings);
             return this._buildResult('settings.update', existingSettings, afterRes.observed_after, 'update', false, 'Verification failed', rollbackPlan, true, rbRes.success ? 'Success' : 'Failed: ' + rbRes.error);
        }

        return this._buildResult('settings.update', existingSettings, afterRes.observed_after, 'update', true);
    }

    // ==========================================
    // MODELS & PRESETS P0 / P1
    // ==========================================

    async modelGetActive() {
        const settingsRes = await this.settingsRead();
        const settings = settingsRes.observed_after;
        
        // api_server_default holds the active API (e.g., openai, anthropic)
        const activeApi = settings.api_server_default;
        
        // We will return the API and the model ID for it
        let activeModel = null;
        if (activeApi === 'openai') activeModel = settings.temp_openai;
        else if (activeApi === 'anthropic') activeModel = settings.temp_anthropic;
        else if (activeApi === 'kobold') activeModel = settings.temp_kobold;
        // fallback
        else activeModel = settings[`temp_${activeApi}`];

        return this._buildResult('model.get_active', null, { api: activeApi, model: activeModel }, 'read', true);
    }

    async modelSetActive(api_server, model_id) {
        // 1. Read before
        const current = await this.modelGetActive();
        
        // 2. Modify
        const settingsRes = await this.settingsRead();
        const existingSettings = settingsRes.observed_after;
        
        const newSettings = { ...existingSettings };
        newSettings.api_server_default = api_server;
        newSettings[`temp_${api_server}`] = model_id;
        
        const rollbackPlan = `Restore api_server_default and temp_${api_server} to observed_before states via /api/settings/save`;

        const saveRes = await this.client.post('/api/settings/save', newSettings);

        if (!saveRes.success) {
             // Attempt rollback
             const rbRes = await this.client.post('/api/settings/save', existingSettings);
             return this._buildResult('model.set_active', current.observed_after, null, 'set', false, saveRes.error, rollbackPlan, true, rbRes.success ? 'Success' : 'Failed: ' + rbRes.error);
        }

        // 3. Verify
        const after = await this.modelGetActive();
        const isVerified = after.observed_after.api === api_server && after.observed_after.model === model_id;
        
        if (!isVerified) {
             const rbRes = await this.client.post('/api/settings/save', existingSettings);
             return this._buildResult('model.set_active', current.observed_after, after.observed_after, 'set', false, 'Model switch failed verification', rollbackPlan, true, rbRes.success ? 'Success' : 'Failed: ' + rbRes.error);
        }

        return this._buildResult('model.set_active', current.observed_after, after.observed_after, 'set', true);
    }

    async modelList() {
        // Just reading settings to get configured backends for MVP
        const settingsRes = await this.settingsRead();
        const settings = settingsRes.observed_after;
        const available = [
            { api: 'openai', configured: !!settings.openai_settings?.api_key, tempModel: settings.temp_openai },
            { api: 'anthropic', configured: !!settings.anthropic_settings?.api_key, tempModel: settings.temp_anthropic }
        ];
        return this._buildResult('model.list', null, available, 'list', true);
    }

    async presetGetActive() {
        // Just grab the current openai preset for MVP example
        // (Full logic would check which API is active and grab its preset)
        const settingsRes = await this.settingsRead();
        const settings = settingsRes.observed_after;
        return this._buildResult('preset.get_active', null, { preset: settings.openai_settings?.preset_settings_openai }, 'get', true);
    }

    // ==========================================
    // CHARACTERS P1
    // ==========================================

    async characterRead(avatar) {
        Schemas.characterRead({ avatar });
        
        // Hack for /api/characters/all since ST doesn't have an easy "get by avatar" out of the box that isn't multipart form
        // Wait, POST /api/characters/all returns the array.
        const res = await this.client.post('/api/characters/all');
        if (!res.success) return this._buildResult('character.read', null, null, 'read', false, res.error);
        
        const card = res.data.find(c => c.avatar === avatar);
        if (!card) return this._buildResult('character.read', null, null, 'read', false, 'Character not found');

        return this._buildResult('character.read', null, card, 'read', true);
    }

    async characterUpdateFields(updates) {
        const validUpdates = Schemas.characterUpdateFields(updates);
        
        // Read before
        const beforeRes = await this.characterRead(validUpdates.avatar);
        if (!beforeRes.ok) return beforeRes; // Pass error up
        
        const existingCard = beforeRes.observed_after;
        const finalCard = { ...existingCard, ...validUpdates };

        // We prepare multipart/form-data for ST.
        const formData = new FormData();
        for (const [key, value] of Object.entries(finalCard)) {
            if (typeof value === 'object') formData.append(key, JSON.stringify(value));
            else formData.append(key, value);
        }
        
        if (!formData.has('avatar_url')) {
            formData.append('avatar_url', validUpdates.avatar);
        }

        const rollbackPlan = `Restore character ${validUpdates.avatar} to exact previous field state via multipart/form-data POST /api/characters/edit`;

        const performRollback = async () => {
             const rbForm = new FormData();
             for (const [key, value] of Object.entries(existingCard)) {
                 if (typeof value === 'object') rbForm.append(key, JSON.stringify(value));
                 else rbForm.append(key, value);
             }
             if (!rbForm.has('avatar_url')) rbForm.append('avatar_url', validUpdates.avatar);
             if (!rbForm.has('ch_name') && existingCard.name) rbForm.append('ch_name', existingCard.name);
             
             try {
                 const rbRes = await fetch(`${this.client.baseUrl}/api/characters/edit`, {
                      method: 'POST', body: rbForm, headers: { 'Accept': 'application/json' }
                 });
                 return rbRes.ok ? 'Success' : `Failed: ${await rbRes.text()}`;
             } catch (e) {
                 return `Failed: ${e.message}`;
             }
        };

        try {
            const saveRes = await fetch(`${this.client.baseUrl}/api/characters/edit`, {
                 method: 'POST',
                 body: formData,
                 headers: { 'Accept': 'application/json' }
            });
            const dataText = await saveRes.text();
            
            if (!saveRes.ok) {
                 const rbResult = await performRollback();
                 return this._buildResult('character.update_fields', existingCard, null, 'update', false, dataText, rollbackPlan, true, rbResult);
            }

            // Verify
            const afterRes = await this.characterRead(validUpdates.avatar);
            const verified = validUpdates.description ? afterRes.observed_after.description === validUpdates.description : true; // Expand logic as needed for MVP
            
            if (!verified) {
                 const rbResult = await performRollback();
                 return this._buildResult('character.update_fields', existingCard, afterRes.observed_after, 'update', false, 'Verification mismatch', rollbackPlan, true, rbResult);
            }

            return this._buildResult('character.update_fields', existingCard, afterRes.observed_after, 'update', true);
        } catch (e) {
            const rbResult = await performRollback();
            return this._buildResult('character.update_fields', existingCard, null, 'update', false, e.message, rollbackPlan, true, rbResult);
        }
    }

    // ==========================================
    // CHATS P1
    // ==========================================

    async chatCurrent(character_name) {
        Schemas.chatCurrent({ character_name });
        
        const setRes = await this.settingsRead();
        if (!setRes.ok) return setRes;
        const settings = setRes.observed_after;
        
        let chatId = null;
        if (settings.recent_chats && Array.isArray(settings.recent_chats)) {
             const rc = settings.recent_chats.find(c => c.character_name === character_name);
             if (rc) chatId = rc.chat_id;
        }

        if (!chatId) return this._buildResult('chat.current', null, null, 'read', false, 'No recent chat found for character');

        const res = await this.client.post('/api/chats/get', { ch_name: character_name, file_name: chatId, avatar_url: 'placeholder.png' });
        if (!res.success) return this._buildResult('chat.current', null, null, 'read', false, res.error);

        return this._buildResult('chat.current', null, { chat_id: chatId, messages: res.data }, 'read', true);
    }

    async chatInject(payload) {
        const { character_name, message_text, is_user } = Schemas.chatInject(payload);
        
        const currentChatObj = await this.chatCurrent(character_name);
        if (!currentChatObj.ok) return currentChatObj;

        const chat_id = currentChatObj.observed_after.chat_id;
        const messages = [...currentChatObj.observed_after.messages];
        
        // Append new
        messages.push({
            name: is_user ? 'User' : character_name,
            is_user: !!is_user,
            is_system: false,
            send_date: Date.now(),
            mes: message_text,
            extra: {}
        });

        // Save back
        const res = await this.client.post('/api/chats/save', {
            ch_name: character_name,
            file_name: chat_id,
            chat: messages
        });

        if (!res.success) return this._buildResult('chat.inject', currentChatObj.observed_after, null, 'inject', false, res.error);

        // Verify
        const afterObj = await this.chatCurrent(character_name);
        const verified = afterObj.observed_after.messages.length === messages.length;

        return this._buildResult('chat.inject', currentChatObj.observed_after, afterObj.observed_after, 'inject', verified);
    }

    // ==========================================
    // LOREBOOKS P1
    // ==========================================

    async lorebookList() {
        const res = await this.client.post('/api/worldinfo/list');
        const list = Object.keys(res.data);
        return this._buildResult('lorebook.list', null, list, 'list', true);
    }

    async lorebookRead(name) {
        Schemas.lorebookRead({ name });
        const res = await this.client.post('/api/worldinfo/get', { name });
        if (!res.success) return this._buildResult('lorebook.read', null, null, 'read', false, res.error);
        return this._buildResult('lorebook.read', null, res.data, 'read', true);
    }

    async lorebookUpsertEntry(payload) {
        const { lorebook_name, keyword, content } = Schemas.lorebookUpsertEntry(payload);
        
        const curRes = await this.lorebookRead(lorebook_name);
        if (!curRes.ok) return curRes; // Fails if book doesn't exist. MVP design assumes it does.
        
        const lb = curRes.observed_after;
        const before = JSON.parse(JSON.stringify(lb)); // Deep clone
        
        // Upsert logic
        // Try finding existing entry by keyword
        const existingId = Object.keys(lb.entries).find(k => lb.entries[k].key.includes(keyword));
        if (existingId) {
             lb.entries[existingId].content = content;
        } else {
             // Generate random ST-style UID
             const newId = Date.now();
             lb.entries[newId] = {
                 uid: newId,
                 key: [keyword],
                 keysecondary: [],
                 comment: "Antigravity Injected",
                 content: content,
                 constant: false,
                 selective: true,
                 order: 100,
                 position: 0,
                 disable: false,
                 excludeRecursion: false,
                 preventRecursion: true,
                 delay: 0
             };
        }

        const rollbackPlan = `Restore complete payload describing lorebook ${lorebook_name} prior to injection`;

        const performRollback = async () => {
             const rbRes = await this.client.post('/api/worldinfo/edit', { name: lorebook_name, data: before });
             return rbRes.success ? 'Success' : `Failed: ${rbRes.error}`;
        };

        const res = await this.client.post('/api/worldinfo/edit', { name: lorebook_name, data: lb });
        if (!res.success) {
            const rbResult = await performRollback();
            return this._buildResult('lorebook.upsert', before, null, 'upsert', false, res.error, rollbackPlan, true, rbResult);
        }

        // Verify
        const afterRes = await this.lorebookRead(lorebook_name);
        const savedEntryId = Object.keys(afterRes.observed_after.entries).find(k => afterRes.observed_after.entries[k].key.includes(keyword));
        const verified = !!savedEntryId && afterRes.observed_after.entries[savedEntryId].content === content;

        if (!verified) {
            const rbResult = await performRollback();
            return this._buildResult('lorebook.upsert', before, afterRes.observed_after, 'upsert', false, 'Verification mismatch on lorebook injection', rollbackPlan, true, rbResult);
        }

        return this._buildResult('lorebook.upsert', before, afterRes.observed_after, 'upsert', true);
    }
}

module.exports = { TavernaOperations };
