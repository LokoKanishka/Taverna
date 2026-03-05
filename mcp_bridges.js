const express = require('express');
const { spawn } = require('child_process');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');

const mcpServers = [
    { id: 'sqlite', name: 'SQLite (USO exclusivo de TAVERNA)', port: 13001, command: 'npx', args: ['-y', '@modelcontextprotocol/server-sqlite', '/home/lucy-ubuntu/Escritorio/Taverna/taverna_stats.db'] },
    { id: 'memory', name: 'Memory (USO exclusivo de TAVERNA)', port: 13002, command: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'] },
    { id: 'filesystem', name: 'Filesystem (USO exclusivo de TAVERNA)', port: 13003, command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/lucy-ubuntu/Escritorio/Taverna'] },
    { id: 'fetch', name: 'Fetch (USO exclusivo de TAVERNA)', port: 13004, command: 'npx', args: ['-y', '@modelcontextprotocol/server-fetch'] }
];

const targetId = process.env.MCP_ID;
const serversToLaunch = targetId ? mcpServers.filter(s => s.id === targetId) : mcpServers;

serversToLaunch.forEach(serverConfig => {
    const app = express();
    let sseTransport = null;

    const mcpProcess = spawn(serverConfig.command, serverConfig.args);

    mcpProcess.stderr.on('data', (data) => {
        console.error(`[${serverConfig.name} stderr]: ${data}`);
    });

    app.get('/sse', async (req, res) => {
        console.log(`🚀 [${serverConfig.name}] Nueva conexión SSE en puerto ${serverConfig.port}`);
        sseTransport = new SSEServerTransport('/messages', res);

        mcpProcess.stdout.on('data', (data) => {
            if (sseTransport) {
                res.write(`data: ${data.toString()}\n\n`);
            }
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

    const port = process.env.PORT || serverConfig.port;
    app.listen(port, () => {
        console.log(`✅ [${serverConfig.name}] Bridge SSE activo en puerto ${port}`);
    });
});
