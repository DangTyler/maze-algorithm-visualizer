/*  frontend/websocket-client.js  */
const status = document.getElementById('status');

const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  status.textContent = '✅ Connected to WebSocket server!';
  console.log('WebSocket connected');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📥 Received:', data);

  /* ---------- route the message ---------- */
  if (data.type === 'visited') {
    // provided by script.js
    window.visualizeVisit?.(data.x, data.y);

  } else if (data.type === 'path') {
    // yellow final‑path cells (add visualizePath in script.js)
    window.visualizePath?.visualizePath(data.x, data.y);

  } else if (data.type === 'done') {
    status.textContent = '✅ Algorithm complete!';
  }
};

socket.onerror = (err) => {
  status.textContent = '❌ WebSocket error: check console';
  console.error('WebSocket error', err);
};

socket.onclose = () => {
  status.textContent = '🔌 Disconnected from WebSocket server';
  console.log('WebSocket closed');
};
