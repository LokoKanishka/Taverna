/**
 * Validation and Schema functions for Taverna Operations.
 * Enforces rigid contracts to prevent destructive states.
 */

function validateSchema(data, requiredFields) {
    if (!data || typeof data !== 'object') {
        throw new Error('Input must be an object');
    }
    const missing = requiredFields.filter(f => data[f] === undefined);
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return data;
}

const Schemas = {
    modelSetActive: (input) => validateSchema(input, ['model_id']),
    
    characterRead: (input) => validateSchema(input, ['avatar']),
    
    characterUpdateFields: (input) => {
        validateSchema(input, ['avatar', 'ch_name']);
        // Only allow specific textual fields for safety in MVP
        const allowedUpdates = ['description', 'personality', 'first_mes', 'scenario', 'mes_example', 'creator_notes', 'system_prompt', 'post_history_instructions', 'alternate_greetings'];
        
        const updates = {};
        for (const key of allowedUpdates) {
            if (input[key] !== undefined) updates[key] = input[key];
        }
        
        if (Object.keys(updates).length === 0) {
            throw new Error('No valid textual fields provided for character update');
        }
        
        return { avatar: input.avatar, ch_name: input.ch_name, ...updates };
    },

    chatCurrent: (input) => validateSchema(input, ['character_name']),
    
    chatInject: (input) => {
        validateSchema(input, ['character_name', 'message_text', 'is_user']);
        return input;
    },

    lorebookRead: (input) => validateSchema(input, ['name']),
    
    lorebookUpsertEntry: (input) => {
        validateSchema(input, ['lorebook_name', 'keyword', 'content']);
        return input;
    },

    settingsUpdate: (input) => {
        // Enforce safe updates only (MVP risk reduction)
        const allowedSafeSettings = [
            'temp', 'api_server_default', 'public_api', 'force_scroll',
            'api_preset_openai', 'api_preset_kobold', 'api_preset_oobabooga',
            'api_preset_ollama', 'api_preset_anthropic', 'api_preset_openrouter'
        ];
        const updates = {};
        
        for (const key of allowedSafeSettings) {
            if (input[key] !== undefined) updates[key] = input[key];
        }
        
        if (Object.keys(updates).length === 0) {
            throw new Error('No valid/safe settings keys provided for update in MVP. Allowed: ' + allowedSafeSettings.join(', '));
        }
        
        return updates;
    },

    presetSetActive: (input) => validateSchema(input, ['apiId', 'preset_name'])
};

module.exports = { Schemas, validateSchema };
