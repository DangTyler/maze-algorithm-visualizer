// frontend/websocket-client.js

const status = document.getElementById('status');
const bfsCounter = document.getElementById('bfsSteps');
const dijkstraCounter = document.getElementById('dijkstraSteps');
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  console.log('🔗 WebSocket connected');
  status.textContent = '✅ Connected to WebSocket server';
};

socket.onmessage = (event) => {
  const raw = event.data;
  console.log('📥 Raw message:', raw);

  let d;
  try {
    d = JSON.parse(raw);
  } catch (err) {
    console.error('⏭️ Invalid JSON—skipping:', raw);
    return;
  }
  console.log('📥 Parsed data:', d);

  switch (d.type) {
    // ─── MAZE LAYOUT ──────────────────────────────────────────────────────────
    case 'maze': {
      console.log('🗺️ Drawing maze walls');
      if (typeof window.clearMaze === 'function') {
        window.clearMaze();
      }
      const grid = d.data;
      for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
          if (grid[x][y] === 1) {
            window.visualizeWallLeft?.(x, y);
            window.visualizeWallRight?.(x, y);
          }
        }
      }
      status.textContent = '🗺️ Maze loaded';
      break;
    }

    // ─── INDIVIDUAL WALL NODES ─────────────────────────────────────────────────
    case 'wall': {
      console.log(`🧱 Wall at (${d.x},${d.y})`);
      window.visualizeWallLeft?.(d.x, d.y);
      window.visualizeWallRight?.(d.x, d.y);
      break;
    }

    // ─── STEPS COUNT ────────────────────────────────────────────────────────────
    case 'steps': {
      const algo = d.algo || 'Unknown';
      console.log(`📏 ${algo} took ${d.count} steps`);
      if (algo === 'BFS') {
        bfsCounter.textContent = d.count;
      } else if (algo === 'Dijkstra') {
        dijkstraCounter.textContent = d.count;
      }
    
      break;
    }

    // ─── BFS or Dijkstra VISIT EVENTS ─────────────────────────────────────────
    case 'visited': {
      const algo = d.algo || 'BFS';
      console.log(`→ ${algo} visited (${d.x},${d.y})`);
      if (algo === 'BFS') window.visualizeVisitLeft?.(d.x, d.y);
      else                 window.visualizeVisitRight?.(d.x, d.y);
      break;
    }

    // ─── BFS or Dijkstra PATH EVENTS ──────────────────────────────────────────
    case 'path': {
      const algo = d.algo || 'BFS';
      console.log(`→ ${algo} path (${d.x},${d.y})`);
      if (algo === 'BFS') window.visualizePathLeft?.(d.x, d.y);
      else                 window.visualizePathRight?.(d.x, d.y);
      break;
    }

    // ─── ALGORITHM DONE ───────────────────────────────────────────────────────
    case 'done':
      console.log(`🏁 ${d.algo} complete`);
      status.textContent = `✅ ${d.algo} complete`;
      break;

    default:
      console.warn('⚠️ Unhandled message type:', d);
  }
};

socket.onerror = (err) => {
  console.error('❌ WebSocket error:', err);
  status.textContent = '❌ WebSocket error';
};

socket.onclose = () => {
  console.log('🔌 WebSocket disconnected');
  status.textContent = '🔌 Disconnected from WebSocket';
};
// Function to reset the maze visuals and step counters
function resetMazeAndCounters() {
  // Reset step counters
  bfsCounter.textContent = '0';
  dijkstraCounter.textContent = '0';
  // Clear visualizations if we have a way to do so
  if (typeof window.clearMaze === 'function') {
    window.clearMaze();
  } else {
    // If no clearMaze function exists, reset the boards using existing functions
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        // Reset to default color
        if (window.visualizeVisitLeft) window.visualizeVisitLeft(x, y, COLOR_GREY);
        if (window.visualizeVisitRight) window.visualizeVisitRight(x, y, COLOR_GREY);
      }
    }
  }
}
// Add event listener to the Generate Maze button
generateBtn.addEventListener('click', () => {
  if (socket.readyState === WebSocket.OPEN) {
    console.log('🔄 Requesting new maze generation');
    status.textContent = '⏳ Generating maze...';
    // Send a request to generate a new maze
    socket.send(JSON.stringify({ 
      action: 'generate'
    }));
    // Reset counters immediately on button click
    bfsCounter.textContent = '0';
    dijkstraCounter.textContent = '0';
  } else {
    console.warn('⚠️ WebSocket not connected');
    status.textContent = '❌ Cannot generate maze: WebSocket not connected';
  }
});
