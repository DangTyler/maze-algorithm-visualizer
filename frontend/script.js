const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
  console.log("🔗 WebSocket connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📥 Received:", data);

  if (data.type === 'visited') {
    // Call your visualization update logic here
    visualizeVisit(data.x, data.y);
  } else if (data.type === 'done') {
    console.log("✅ Algorithm complete.");
  }
};

socket.onclose = () => {
  console.log("🔌 WebSocket disconnected");
};
