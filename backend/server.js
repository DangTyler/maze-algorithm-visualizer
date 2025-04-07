// backend/server.js
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('✅ WebSocket server started on ws://localhost:8080');
});

wss.on('connection', (ws) => {
  console.log('🌐 Client connected');

  const isWindows = process.platform === 'win32';
  const algoPath = isWindows
    ? path.join(__dirname, 'algorithms', 'bfs.exe')
    : path.join(__dirname, 'algorithms', 'bfs');

  const algo = spawn(algoPath);

  algo.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach((line) => {
      console.log('📤 Sending to client:', line);
      ws.send(line);
    });
  });

  algo.stderr.on('data', (err) => {
    console.error('⚠️ Error from C++:', err.toString());
  });

  algo.on('close', (code) => {
    console.log(`🚪 C++ process exited with code ${code}`);
    ws.send(JSON.stringify({ type: 'done' }));
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    algo.kill();
  });
});
