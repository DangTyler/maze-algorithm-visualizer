#include <bits/stdc++.h>
#include <vector>
#include <cstdint>
using namespace std;

const int N = 317;
const int INF = INT_MAX;

// 0 = passage, 1 = wall
vector<vector<int>> maze(N, vector<int>(N, 1));

// Distance and parent arrays for BFS and Dijkstra
vector<vector<int>> dist0(N, vector<int>(N, INF));
vector<vector<int>> distD(N, vector<int>(N, INF));
vector<vector<pair<int,int>>> parent0(N, vector<pair<int,int>>(N, {-1,-1}));
vector<vector<pair<int,int>>> parentD(N, vector<pair<int,int>>(N, {-1,-1}));

// 4-directional movement
vector<pair<int,int>> dirs = {{1,0},{-1,0},{0,1},{0,-1}};

void generateMaze() {
    if (N % 2 == 0) {
        cerr << "N must be odd\n";
        exit(1);
    }

    // Fill entire grid with walls
    for (int i = 0; i < N; ++i)
        for (int j = 0; j < N; ++j)
            maze[i][j] = 1;

    mt19937_64 rng((unsigned)time(nullptr));

    // Iterative carve (MUST HAVE, recursive causes stack overflow)
    stack<pair<int,int>> st;
    st.push({1, 1});
    maze[1][1] = 0;

    while (!st.empty()) {
        auto [cx, cy] = st.top();

        // get neighbors
        array<pair<int,int>,4> cand = {{
            {cx + 2, cy},
            {cx - 2, cy},
            {cx, cy + 2},
            {cx, cy - 2}
        }};
        vector<pair<int,int>> nbrs;
        for (auto &p : cand) {
            auto [nx, ny] = p;
            if (nx > 0 && nx < N-1 && ny > 0 && ny < N-1 && maze[nx][ny] == 1) {
                nbrs.push_back(p);
            }
        }

        if (!nbrs.empty()) {
            auto [nx, ny] = nbrs[rng() % nbrs.size()];
        
            maze[(cx + nx) / 2][(cy + ny) / 2] = 0;
            maze[nx][ny] = 0;
          
            st.push({nx, ny});
        } else {
            // backtrack
            st.pop();
        }
    }

    // Create an exit
    maze[N-2][N-1] = 0;
}

void zeroOneBFS() {
    deque<pair<int,int>> dq;
    dist0[0][0] = maze[0][0];
    parent0[0][0] = {0,0};
    dq.emplace_back(0,0);

    while (!dq.empty()) {
        auto [x,y] = dq.front(); dq.pop_front();
        for (auto &d : dirs) {
            int nx = x + d.first, ny = y + d.second;
            if (nx<0||nx>=N||ny<0||ny>=N) continue;
            int w = maze[nx][ny];
            int nd = dist0[x][y] + w;
            if (nd < dist0[nx][ny]) {
                dist0[nx][ny] = nd;
                parent0[nx][ny] = {x,y};
                cout << "{\"algo\":\"BFS\",\"type\":\"visited\",\"x\":"<<nx
                     <<",\"y\":"<<ny<<"}" << endl;
                if (w==0) dq.emplace_front(nx,ny);
                else      dq.emplace_back (nx,ny);
            }
        }
    }

    // Reconstruct path
    vector<pair<int,int>> path;
    int x = N-1, y = N-1;
    if (parent0[x][y].first != -1) {
        while (!(x==0 && y==0)) {
            path.emplace_back(x,y);
            tie(x,y) = parent0[x][y];
        }
        path.emplace_back(0,0);
        reverse(path.begin(), path.end());
    }
    for (auto &p : path) {
        cout << "{\"algo\":\"BFS\",\"type\":\"path\",\"x\":"<<p.first
             <<",\"y\":"<<p.second<<"}" << endl;
    }

    int steps = max(0, (int)path.size() - 1);
    cout << "{\"algo\":\"BFS\",\"type\":\"steps\",\"count\":" << steps << "}" << endl;
    cout << "{\"algo\":\"BFS\",\"type\":\"done\"}" << endl;
}

void dijkstra() {
    using T = tuple<int,int,int>;
    priority_queue<T, vector<T>, greater<T>> pq;
    distD[0][0] = maze[0][0];
    parentD[0][0] = {0,0};
    pq.emplace(distD[0][0], 0, 0);

    while (!pq.empty()) {
        auto [d,x,y] = pq.top(); pq.pop();
        if (d > distD[x][y]) continue;
        for (auto &dir : dirs) {
            int nx = x + dir.first, ny = y + dir.second;
            if (nx<0||nx>=N||ny<0||ny>=N) continue;
            int nd = d + maze[nx][ny];
            if (nd < distD[nx][ny]) {
                distD[nx][ny] = nd;
                parentD[nx][ny] = {x,y};
                cout << "{\"algo\":\"Dijkstra\",\"type\":\"visited\",\"x\":"<<nx
                     <<",\"y\":"<<ny<<"}" << endl;
                pq.emplace(nd, nx, ny);
            }
        }
    }

    // Reconstruct path
    vector<pair<int,int>> path;
    int x = N-1, y = N-1;
    if (parentD[x][y].first != -1) {
        while (!(x==0 && y==0)) {
            path.emplace_back(x,y);
            tie(x,y) = parentD[x][y];
        }
        path.emplace_back(0,0);
        reverse(path.begin(), path.end());
    }
    for (auto &p : path) {
        cout << "{\"algo\":\"Dijkstra\",\"type\":\"path\",\"x\":"<<p.first
             <<",\"y\":"<<p.second<<"}" << endl;
    }

    int steps = max(0, (int)path.size() - 1);
    cout << "{\"algo\":\"Dijkstra\",\"type\":\"steps\",\"count\":" << steps << "}" << endl;
    cout << "{\"algo\":\"Dijkstra\",\"type\":\"done\"}" << endl;
}

int main() {
    generateMaze();
    zeroOneBFS();
    dijkstra();

    // Output all wall cells
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            if (maze[i][j] == 1) {
                cout << "{\"type\":\"wall\",\"x\":" << i
                     << ",\"y\":" << j << "}" << endl;
            }
        }
    }

    return 0;
}
