// backend/server.js
const WebSocket = require("ws");
const { spawn } = require("child_process");
const path = require("path");

const wss = new WebSocket.Server(
  {
    port: 8080,
    maxPayload: 10 * 1024 * 1024,
  },
  () => console.log("WebSocket server on ws://localhost:8080")
);

wss.on("connection", (ws) => {
  console.log("Client connected");

  let algo = null;

  ws.on("message", (msg) => {
    let req;
    try {
      req = JSON.parse(msg);
    } catch {
      return;
    }

    if (req.action === "generate") {
      if (algo) {
        algo.kill();
      }

      console.log("Generating new maze and running algorithms");

      // run the search algorithm (compiled binary)
      const bin = path.join(__dirname, "algorithms", "bfs");
      algo = spawn(bin);

      // pipe stdout lines to frontend
      algo.stdout.on("data", (chunk) => {
        chunk
          .toString()
          .split("\n")
          .filter(Boolean)
          .forEach((line) => ws.send(line));
      });

      // log errors if algorithm fails
      algo.stderr.on("data", (err) => {
        console.error("⚠️ Algorithm error:", err.toString());
      });

      // notify when algorithm exits
      algo.on("close", (code) => {
        console.log(`🔚 Algorithm process exited (${code})`);
        algo = null;
      });
    }
  });

  // kill process if client closes early
  ws.on("close", () => algo.kill());
});
