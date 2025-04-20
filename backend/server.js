// backend/server.js
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path      = require('path');

const wss = new WebSocket.Server({ 
  port: 8080,
  maxPayload: 10 * 1024 * 1024,
}, () =>
  console.log('✅ WebSocket server on ws://localhost:8080')
);

wss.on('connection', (ws) => {
  console.log('🌐 Client connected');

  // run the search algorithm (compiled binary)
  const bin = path.join(__dirname, 'algorithms', 'bfs');
  const algo = spawn(bin);

  // pipe stdout lines to frontend
  algo.stdout.on('data', (chunk) => {
    chunk.toString()
      .split('\n')
      .filter(Boolean)
      .forEach(line => ws.send(line));
  });

  // log errors if algorithm fails
  algo.stderr.on('data', (err) => {
    console.error('⚠️ Algorithm error:', err.toString());
  });

  // notify when algorithm exits
  algo.on('close', (code) => {
    console.log(`🔚 Algorithm process exited (${code})`);
  });

  // kill process if client closes early
  ws.on('close', () => algo.kill());
});
