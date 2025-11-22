const WebSocket = require('ws');
const express = require('express');

const app = express();
const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Atom Messenger server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Хранилище сообщений
const messages = [];

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Отправляем историю сообщений
    ws.send(JSON.stringify({
        type: 'history',
        messages: messages
    }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'message') {
            const msg = {
                sender: data.sender,
                text: data.text,
                timestamp: new Date().toISOString()
            };
            messages.push(msg);
            // Отправляем сообщение всем клиентам
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        sender: msg.sender,
                        text: msg.text
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
