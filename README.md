# maze-algorithm-visualizer

# 1. Install dependencies
cd backend

npm install

# 2. Compile the algorithm
cd backend/algorithms

g++ bfs.cpp -o bfs   

# 3. Start the WebSocket server
cd backend

node server.js

# 4. Serve the frontend
cd frontend

python3 -m http.server 5500

# 5. Visit in browser
http://localhost:5500

# How do you know it's working?
Inspect element on the browser and check the console if you see messages saying "Received: blablabla."

Make sure both the frontend and the backend are running by following the above steps. You may need to open two terminals to do this.

Refresh your localhost:5500 browser to test again.
