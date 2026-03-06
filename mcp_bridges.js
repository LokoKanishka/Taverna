const express = require('express');
const { spawn } = require('child_process');

// ============================================================
//  TAVERNA MCP BRIDGE — 20 servidores (USO EXCLUSIVO TAVERNA)
//  Proyecto: SILLY_TAVERN__Q2M8
// ============================================================

const TAVERNA_ROOT = '/home/lucy-ubuntu/Escritorio/Taverna';

const mcpServers = [
    // ── Tier 0: EXISTENTES ──────────────────────────────────
    {
        id: 'sqlite',
        name: 'SQLite',
        port: 13001,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sqlite', `${TAVERNA_ROOT}/taverna_stats.db`]
    },
    {
        id: 'memory',
        name: 'Memory',
        port: 13002,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory']
    },
    {
        id: 'filesystem',
        name: 'Filesystem',
        port: 13003,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', TAVERNA_ROOT]
    },
    {
        id: 'fetch',
        name: 'Fetch',
        port: 13004,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-fetch']
    },

    // ── Tier 1: IMPACTO DIRECTO ─────────────────────────────
    {
        id: 'git',
        name: 'Git',
        port: 13005,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-git', '--repository', TAVERNA_ROOT]
    },
    {
        id: 'time',
        name: 'Time',
        port: 13006,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-time']
    },
    {
        id: 'puppeteer',
        name: 'Puppeteer',
        port: 13007,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer']
    },
    {
        id: 'sequential-thinking',
        name: 'SequentialThinking',
        port: 13008,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
    },

    // ── Tier 2: DATOS Y CONTENIDO ───────────────────────────
    {
        id: 'postgres',
        name: 'PostgreSQL',
        port: 13009,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        env: {
            // Configurar cuando tengas PostgreSQL corriendo:
            POSTGRES_CONNECTION_STRING: process.env.TAVERNA_POSTGRES_URL || 'postgresql://localhost:5432/taverna'
        }
    },
    {
        id: 'brave-search',
        name: 'BraveSearch',
        port: 13010,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: {
            // Obtener en: https://brave.com/search/api/
            BRAVE_API_KEY: process.env.BRAVE_API_KEY || 'CONFIGURAR_API_KEY'
        }
    },
    {
        id: 'google-maps',
        name: 'GoogleMaps',
        port: 13011,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-google-maps'],
        env: {
            // Obtener en: https://console.cloud.google.com/
            GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'CONFIGURAR_API_KEY'
        }
    },
    {
        id: 'github',
        name: 'GitHub',
        port: 13012,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
            // Obtener en: https://github.com/settings/tokens
            GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || 'CONFIGURAR_TOKEN'
        }
    },

    // ── Tier 3: MULTIMEDIA Y MONITOREO ──────────────────────
    {
        id: 'everart',
        name: 'EverArt',
        port: 13013,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-everart'],
        env: {
            // Obtener en: https://everart.ai/
            EVERART_API_KEY: process.env.EVERART_API_KEY || 'CONFIGURAR_API_KEY'
        }
    },
    {
        id: 'sentry',
        name: 'Sentry',
        port: 13014,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sentry'],
        env: {
            // Obtener en: https://sentry.io/
            SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || 'CONFIGURAR_TOKEN',
            SENTRY_ORG: process.env.SENTRY_ORG || 'taverna'
        }
    },
    {
        id: 'slack',
        name: 'Slack',
        port: 13015,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-slack'],
        env: {
            // Obtener en: https://api.slack.com/apps
            SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || 'CONFIGURAR_TOKEN',
            SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || 'CONFIGURAR_TEAM_ID'
        }
    },
    {
        id: 'gdrive',
        name: 'GoogleDrive',
        port: 13016,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-gdrive'],
        env: {
            // Requiere OAuth — configurar credentials en Google Cloud Console
            GDRIVE_CLIENT_ID: process.env.GDRIVE_CLIENT_ID || 'CONFIGURAR',
            GDRIVE_CLIENT_SECRET: process.env.GDRIVE_CLIENT_SECRET || 'CONFIGURAR'
        }
    },

    // ── Tier 4: ORQUESTACIÓN AVANZADA ───────────────────────
    {
        id: 'n8n',
        name: 'n8n',
        port: 13017,
        command: 'npx',
        args: ['-y', 'mcp-server-n8n'],
        env: {
            // Configurar con tu instancia n8n
            N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
            N8N_API_KEY: process.env.N8N_API_KEY || 'CONFIGURAR_API_KEY'
        }
    },
    {
        id: 'docker',
        name: 'Docker',
        port: 13018,
        command: 'npx',
        args: ['-y', 'mcp-server-docker']
    },
    {
        id: 'redis',
        name: 'Redis',
        port: 13019,
        command: 'npx',
        args: ['-y', 'mcp-server-redis'],
        env: {
            REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
        }
    },
    {
        id: 'supabase',
        name: 'Supabase',
        port: 13020,
        command: 'npx',
        args: ['-y', '@supabase/mcp-server-supabase'],
        env: {
            // Obtener en: https://supabase.com/dashboard
            SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN || 'CONFIGURAR_TOKEN'
        }
    }
];

// ── BRIDGE ENGINE ───────────────────────────────────────────
// Seleccionar server por MCP_ID o lanzar todos
const targetId = process.env.MCP_ID;
const serversToLaunch = targetId
    ? mcpServers.filter(s => s.id === targetId)
    : mcpServers;

if (serversToLaunch.length === 0) {
    console.error(`❌ MCP_ID "${targetId}" no encontrado. IDs válidos: ${mcpServers.map(s => s.id).join(', ')}`);
    process.exit(1);
}

serversToLaunch.forEach(serverConfig => {
    const app = express();
    let sseTransport = null;

    // Merge env vars: process.env + server-specific env
    const childEnv = { ...process.env, ...(serverConfig.env || {}) };

    const mcpProcess = spawn(serverConfig.command, serverConfig.args, {
        env: childEnv
    });

    mcpProcess.on('error', (err) => {
        console.error(`❌ [${serverConfig.name}] Error al iniciar: ${err.message}`);
    });

    mcpProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`⚠️  [${serverConfig.name}] Proceso terminó con código ${code}`);
        }
    });

    mcpProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        // Filtrar warnings de npm que no son errores reales
        if (!msg.includes('npm warn') && !msg.includes('npm WARN')) {
            console.error(`[${serverConfig.name} stderr]: ${msg}`);
        }
    });

    app.get('/sse', async (req, res) => {
        console.log(`🔗 [${serverConfig.name}] Nueva conexión SSE en puerto ${serverConfig.port}`);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        sseTransport = res;

        mcpProcess.stdout.on('data', (data) => {
            if (sseTransport) {
                res.write(`data: ${data.toString()}\n\n`);
            }
        });

        req.on('close', () => {
            console.log(`🔌 [${serverConfig.name}] Conexión SSE cerrada`);
            sseTransport = null;
        });
    });

    app.post('/messages', express.json(), async (req, res) => {
        if (mcpProcess.stdin.writable) {
            mcpProcess.stdin.write(JSON.stringify(req.body) + '\n');
            res.status(200).send('OK');
        } else {
            res.status(500).send('MCP process stdin not writable');
        }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            server: serverConfig.name,
            id: serverConfig.id,
            port: serverConfig.port,
            status: mcpProcess.exitCode === null ? 'running' : 'stopped',
            pid: mcpProcess.pid
        });
    });

    const port = process.env.PORT || serverConfig.port;
    app.listen(port, () => {
        console.log(`✅ [${serverConfig.name}] Bridge activo → http://localhost:${port}/sse`);
    });
});

console.log(`\n🏴‍☠️  Taverna MCP Bridge — ${serversToLaunch.length} servidor(es) inicializando...\n`);
