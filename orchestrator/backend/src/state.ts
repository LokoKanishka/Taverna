export interface GlobalState {
    system: {
        runtime_up: boolean;
        backend_plugin_up: boolean;
        frontend_extension_up: boolean;
        poll_active: boolean;
    };
    commands: {
        queue_depth: number;
        last_command_sent: number;
        last_command_consumed: number;
        last_verified_effect: number;
    };
    errors: {
        recent_errors: string[];
    };
    context: {
        current_mode: string;
    };
}

const state: GlobalState = {
    system: {
        runtime_up: true, // If this code runs, node is up
        backend_plugin_up: true,
        frontend_extension_up: false,
        poll_active: false
    },
    commands: {
        queue_depth: 0,
        last_command_sent: 0,
        last_command_consumed: 0,
        last_verified_effect: 0
    },
    errors: {
        recent_errors: []
    },
    context: {
        current_mode: 'operational'
    }
};

export function getState(): GlobalState {
    return state;
}

export function recordError(err: string) {
    state.errors.recent_errors.push(`[${new Date().toISOString()}] ${err}`);
    if (state.errors.recent_errors.length > 10) {
        state.errors.recent_errors.shift();
    }
}

export function updateStateObject(updates: Partial<GlobalState>) {
    Object.assign(state, updates);
}

export function updateSystem(updates: Partial<GlobalState['system']>) {
    Object.assign(state.system, updates);
}

export function updateCommands(updates: Partial<GlobalState['commands']>) {
    Object.assign(state.commands, updates);
}
