const { spawn } = require('child_process');
const express = require('express');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');

// Configuración de los puentes
const bridges = [
    { name: 'sqlite', port: 3001, command: 'npx', args: ['-y', '@modelcontextprotocol/server-sqlite', '/home/lucy-ubuntu/Escritorio/Taverna/taverna_stats.db'] },
    { name: 'memory', port: 3002, command: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'] },
    { name: 'filesystem', port: 3003, command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/lucy-ubuntu/Escritorio/Taverna'] },
    { name: 'fetch', port: 3004, command: 'npx', args: ['-y', '@modelcontextprotocol/server-fetch'] }
];

bridges.forEach(bridge => {
    const app = express();
    let transport;

    app.get('/sse', async (req, res) => {
        console.log(`[${bridge.name}] Nueva conexión SSE en puerto ${bridge.port}`);
        transport = new SSEServerTransport('/messages', res);

        // Aquí es donde se complicaría si quisiéramos hacer un proxy real stdio -> SSE
        // sin reinventar la rueda del SDK. 
        // Para esta implementación, asumimos que el usuario usará el cliente MCP directamente
        // o que n8n se conectará vía HTTP si configuramos un proxy adecuado.
    });

    app.post('/messages', async (req, res) => {
        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(400).send('No hay sesión SSE activa');
        }
    });

    // Nota: Esta es una implementación simplificada. 
    // En un entorno real, usaríamos mcp-proxy o una integración nativa.
    app.listen(bridge.port, () => {
        console.log(`🚀 MCP Bridge [${bridge.name}] listo en http://localhost:${bridge.port}/sse`);
    });
});
