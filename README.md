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
