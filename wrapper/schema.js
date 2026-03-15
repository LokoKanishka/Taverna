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

    characterImport: (input) => {
        validateSchema(input, ['file_path', 'file_type']);
        const allowedTypes = ['png', 'json', 'charx', 'yaml', 'yml', 'byaf'];
        if (!allowedTypes.includes(input.file_type)) {
            throw new Error(`Invalid file_type: ${input.file_type}. Allowed: ${allowedTypes.join(', ')}`);
        }
        return input;
    },

    chatReadFull: (input) => validateSchema(input, ['file_id']), // avatar/group handled by presence
    
    chatSaveFullSafe: (input) => {
        validateSchema(input, ['file_id', 'chat', 'expected_before_count']);
        if (!Array.isArray(input.chat)) throw new Error('chat must be an array of messages');
        return input;
    },

    chatAppendMessageSafe: (input) => {
        validateSchema(input, ['target_name_or_group', 'message_text']);
        return input;
    },

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

    presetSetActive: (input) => validateSchema(input, ['apiId', 'preset_name']),

    characterDeleteBulk: (input) => {
        // Enforce safety defaults
        const defaults = {
            delete_chats: true,
            dry_run: true,
            confirm: false,
            targets: []
        };
        const data = { ...defaults, ...input };
        
        if (!Array.isArray(data.targets)) {
            throw new Error('targets must be an array of strings (names or avatar filenames)');
        }
        
        return data;
    },

    groupDelete: (input) => {
        validateSchema(input, ['id']);
        return {
            id: String(input.id),
            dry_run: input.dry_run !== false,
            confirm: !!input.confirm
        };
    },

    lorebookUpdate: (input) => {
        validateSchema(input, ['name', 'data']);
        if (!input.data.entries) throw new Error('Lorebook data must contain entries');
        return input;
    },
    chatDelete: (input) => {
        validateSchema(input, ['avatar_url', 'file_name']);
        return {
            avatar_url: input.avatar_url,
            file_name: input.file_name,
            dry_run: input.dry_run !== false,
            confirm: !!input.confirm
        };
    },

    audioSetProvider: (input) => validateSchema(input, ['provider_id']),

    audioSetVoiceMapping: (input) => validateSchema(input, ['character_id', 'voice_id', 'provider_id']),

    audioSTTSetMode: (input) => validateSchema(input, ['enabled', 'provider', 'mode'])
};

module.exports = { Schemas, validateSchema };
