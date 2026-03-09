import bodyParser from 'body-parser';
import { Router, Request, Response } from 'express';
import { Chalk } from 'chalk';

/**
 * TAVERNA ORCHESTRATOR CORE - BACKEND PLUGIN
 * Minimal bridge to allow external control of SillyTavern.
 */

interface CommandEntry {
    command: string;
    type: string;
    data: any;
    timestamp: number;
}

interface PluginInfo {
    id: string;
    name: string;
    description: string;
}

const chalk = new Chalk();
const MODULE_NAME = '[ST-Orchestrator]';

// In-memory command queue. Decouples external POSTs from client-side Polling.
let commandQueue: CommandEntry[] = [];

/**
 * Main plugin entry point (SillyTavern Server Plugin API)
 */
export async function init(router: Router): Promise<void> {
    const jsonParser = bodyParser.json();

    // Health check endpoint
    router.post('/probe', (_req: Request, res: Response) => {
        return res.json({ status: 'ok', plugin: 'st-orchestrator' });
    });

    /**
     * POST /execute
     * Receives commands from external agents (VS Code, Antigravity, etc.)
     */
    router.post('/execute', jsonParser, async (req: Request, res: Response) => {
        try {
            const { command, type = 'raw', data } = req.body;

            if (!command && !data) {
                return res.status(400).json({ status: 'error', error: 'Missing command payload' });
            }

            console.log(chalk.cyan(MODULE_NAME), `Queueing command [${type}]:`, command || JSON.stringify(data));

            commandQueue.push({
                command: command || '',
                type,
                data,
                timestamp: Date.now()
            });

            return res.json({
                status: 'success',
                message: 'Command queued for execution',
                queue_size: commandQueue.length
            });
        } catch (error) {
            console.error(chalk.red(MODULE_NAME), 'Execution error:', error);
            return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
        }
    });

    /**
     * GET /poll
     * Endpoint used by the frontend extension to retrieve and clear the queue.
     */
    router.get('/poll', (_req: Request, res: Response) => {
        const batch = [...commandQueue];
        commandQueue = [];
        return res.json(batch);
    });

    console.log(chalk.green(MODULE_NAME), 'Backend Bridge ready at /api/plugins/st-orchestrator');
}

export async function exit(): Promise<void> {
    console.log(chalk.yellow(MODULE_NAME), 'Exiting');
}

export const info: PluginInfo = {
    id: 'st-orchestrator',
    name: 'Taverna Orchestrator Core',
    description: 'Bridge for external agents to control SillyTavern via commands.',
};

export default { init, exit, info };
