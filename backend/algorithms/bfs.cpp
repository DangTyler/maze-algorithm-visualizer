#include <iostream>
#include <thread>
#include <chrono>

int main() {
    for (int x = 0; x < 5; ++x) {
        for (int y = 0; y < 5; ++y) {
            std::cout << "{\"x\":" << x << ",\"y\":" << y << ",\"type\":\"visited\"}" << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(100)); // Simulate step-by-step
        }
    }
    std::cout << "{\"type\":\"done\"}" << std::endl;
    return 0;
}
