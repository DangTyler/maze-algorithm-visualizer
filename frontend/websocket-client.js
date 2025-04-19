const status = document.getElementById("status");

const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
  status.textContent = "✅ Connected to WebSocket server!";
  console.log("WebSocket connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
}; 

   if (data.type === 'visited') {
    const offset = data.algo === 'dijkstra' ? 15:0;
    visualizeVisit(data.x + offset, data.y);
  }
   if (data.type === 'done') {
    console.log(`✅ ${data.algo} completed.`);
  }
};

socket.onerror = (err) => {
  status.textContent = "❌ WebSocket error: check console";
  console.error("WebSocket error", err);
};

socket.onclose = () => {
  status.textContent = "🔌 Disconnected from WebSocket server";
  console.log("WebSocket closed");
};
