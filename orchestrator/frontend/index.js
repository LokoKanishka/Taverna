/**
 * TAVERNA ORCHESTRATOR - CLIENT EXTENSION
 * Periodically polls the backend for pending commands and executes them.
 */

(function () {
    const POLL_INTERVAL = 1000; // ms
    const BRIDGE_ENDPOINT = '/api/plugins/st-orchestrator/poll';
    const LOG_PREFIX = '[ST-Orchestrator]';

    /**
     * Imports the command execution engine from SillyTavern core.
     * Note: This path assumes the extension is placed in:
     * SillyTavern/data/default-user/extensions/ST-Orchestrator/index.js
     */
    async function getExecutor() {
        try {
            const module = await import('../../../slash-commands.js');
            return module.executeSlashCommands;
        } catch (e) {
            console.error(`${LOG_PREFIX} Failed to load slash-commands.js`, e);
            return null;
        }
    }

    async function poll() {
        try {
            const execute = await getExecutor();
            if (!execute) return;

            const response = await fetch(BRIDGE_ENDPOINT);
            if (!response.ok) return;

            const commands = await response.json();

            for (const item of commands) {
                if (item.command) {
                    console.log(`${LOG_PREFIX} Remote command:`, item.command);
                    await execute(item.command);
                }
            }
        } catch (error) {
            console.error(`${LOG_PREFIX} Polling error:`, error);
        }
    }

    function start() {
        console.log(`${LOG_PREFIX} Minimal bridge initialized. Polling endpoint: ${BRIDGE_ENDPOINT}`);
        setInterval(poll, POLL_INTERVAL);
    }

    // Delay start slightly to ensure ST environment is ready
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
})();
