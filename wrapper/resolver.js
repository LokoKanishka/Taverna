/**
 * Natural Language to Taverna Operations Resolver
 * MVP: Regex/Keyword based intent recognition and arg normalizer.
 */

class NLResolver {
    constructor(operations) {
        this.ops = operations;
    }

    /**
     * Resolves raw text into a canonical intent and normalized arguments.
     * In a production layer, this might be an LLM call. Here it's an explicit matcher for safety.
     */
    _resolveIntent(rawText) {
        const text = rawText.toLowerCase().trim();

        if (text.includes('sano') || text.includes('health') || text.includes('estado')) {
            return { intent: 'sys_health_check', args: {} };
        }
        if (text.includes('listame los modelos') || text.includes('modelos disponibles')) {
            return { intent: 'model_list', args: {} };
        }
        if (text.includes('qué modelo está') || text.includes('cual es el modelo')) {
            return { intent: 'model_get_active', args: {} };
        }
        if (text.startsWith('cambiá al modelo')) {
            const parts = text.replace('cambiá al modelo ', '').trim().split(' ');
            if (parts.length >= 2) {
                return { intent: 'model_set_active', args: { api_server: parts[0], model_id: parts.slice(1).join(' ') } };
            }
        }
        if (text.startsWith('mostrame el personaje')) {
            // Use rawText to preserve case for avatar
            const avatarRaw = rawText.substring(rawText.toLowerCase().indexOf('mostrame el personaje ') + 22).trim();
            return { intent: 'char_read', args: { avatar: avatarRaw + (avatarRaw.toLowerCase().endsWith('.png') ? '' : '.png') } };
        }
        if (text.startsWith('agregale al personaje')) {
            // Use regex on rawText to preserve casing
            const match = rawText.match(/personaje (.*?) este rasgo: (.*)/i);
            if (match) {
                 const avatarRaw = match[1].trim();
                 const avatar = avatarRaw + (avatarRaw.toLowerCase().endsWith('.png') ? '' : '.png');
                 const ch_name = avatarRaw.replace(/(\.png)$/i, '');
                 return { intent: 'char_edit', args: { avatar, ch_name, description: "Rasgos nuevos: " + match[2] } };
            }
        }
        if (text.includes('listame los lorebooks')) {
            return { intent: 'lorebook_list', args: {} };
        }
        if (text.startsWith('creá una entrada en el lorebook')) {
            const match = text.match(/lorebook (.*?) con la clave (.*?) y el contenido (.*)/);
            if (match) {
                return { intent: 'lorebook_upsert', args: { lorebook_name: match[1].trim(), keyword: match[2].trim(), content: match[3].trim() } };
            }
        }
        if (text.startsWith('decime el valor de la setting')) {
            const key = text.replace('decime el valor de la setting ', '').trim();
            return { intent: 'settings_read', args: { key } };
        }
        if (text.startsWith('cambiá la setting')) {
            const match = text.match(/setting (.*?) a (.*)/);
            if (match) {
                 const key = match[1].trim();
                 let val = match[2].trim() === 'true' ? true : (match[2].trim() === 'false' ? false : match[2].trim());
                 if (!isNaN(val) && typeof val !== 'boolean') val = Number(val);

                 const updates = {};
                 updates[key] = val;
                 return { intent: 'settings_update', args: updates };
            }
        }

        return { intent: 'unknown', args: {} };
    }

    /**
     * Dispatcher: Executes the mapped operation and structures the output.
     */
    async process(userText) {
        const { intent, args } = this._resolveIntent(userText);
        
        const baseOutput = {
            ok: false,
            user_request: userText,
            resolved_intent: intent,
            mapped_operation: null,
            arguments: args,
            observed_before: null,
            action_taken: null,
            observed_after: null,
            operation_ok: false,
            verified: false,
            rollback_attempted: false,
            rollback_ok: false,
            final_state_restored: false,
            rollback_result_raw: null,
            error: null
        };

        if (intent === 'unknown') {
            baseOutput.error = "Ambiguous or unsupported intent. Aborted.";
            return baseOutput;
        }

        try {
            let res;
            switch (intent) {
                case 'sys_health_check':
                    baseOutput.mapped_operation = 'health.status';
                    res = await this.ops.healthStatus();
                    break;
                case 'model_list':
                    baseOutput.mapped_operation = 'model.list';
                    res = await this.ops.modelList();
                    break;
                case 'model_get_active':
                    baseOutput.mapped_operation = 'model.get_active';
                    res = await this.ops.modelGetActive();
                    break;
                case 'model_set_active':
                    baseOutput.mapped_operation = 'model.set_active';
                    res = await this.ops.modelSetActive(args.api_server, args.model_id);
                    break;
                case 'char_read':
                    baseOutput.mapped_operation = 'character.read';
                    res = await this.ops.characterRead(args.avatar);
                    break;
                case 'char_edit':
                    baseOutput.mapped_operation = 'character.update_fields';
                    res = await this.ops.characterUpdateFields(args);
                    break;
                case 'lorebook_list':
                    baseOutput.mapped_operation = 'lorebook.list';
                    res = await this.ops.lorebookList();
                    break;
                case 'lorebook_upsert':
                    baseOutput.mapped_operation = 'lorebook.upsert_entry';
                    res = await this.ops.lorebookUpsertEntry(args);
                    break;
                case 'settings_read':
                    baseOutput.mapped_operation = 'settings.read';
                    res = await this.ops.settingsRead();
                    if (res.ok && res.observed_after !== undefined) {
                         // Filter just the requested key for output clarity
                         res.observed_after = res.observed_after[args.key] !== undefined ? res.observed_after[args.key] : null;
                    }
                    break;
                case 'settings_update':
                    baseOutput.mapped_operation = 'settings.update';
                    res = await this.ops.settingsUpdate(args);
                    break;
            }

            // Merge operation result into struct
            if (res) {
                 baseOutput.ok = res.operation_ok && (!res.rollback_attempted || res.rollback_ok); 
                 baseOutput.observed_before = res.observed_before;
                 baseOutput.action_taken = res.action_taken;
                 baseOutput.observed_after = res.observed_after;
                 baseOutput.operation_ok = res.operation_ok;
                 baseOutput.verified = res.verified;
                 baseOutput.rollback_attempted = res.rollback_attempted;
                 baseOutput.rollback_ok = res.rollback_ok;
                 baseOutput.final_state_restored = res.final_state_restored;
                 baseOutput.rollback_result_raw = res.rollback_result_raw;
                 baseOutput.error = res.error;
            }

            return baseOutput;
            
        } catch (e) {
            baseOutput.error = e.message;
            return baseOutput;
        }
    }
}

module.exports = { NLResolver };
