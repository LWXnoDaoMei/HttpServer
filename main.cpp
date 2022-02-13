#include "http_server.h"
#include "get_static.h"
// #include "thread_pool.h"
#include "debugger.h"
#include <signal.h>
// #include <unistd.h>

HttpServer *server = nullptr;

void on_exit(int sig_num) {
    delete server;
    exit(0);
}

// Locker locker;
// int cnt = 0;

// class TestClass {
// public:
//     void handle() {
//         sleep(1);
//         locker.lock();
//         printf("%d\n", ++ cnt);
//         locker.unlock();
//     }
// };

int main() {
    signal(SIGINT, on_exit);
    server = new HttpServer("101.200.142.161", 23333);
    server->root.add_func("static", get_static);
    server->run();

    // ThreadPool<TestClass> thread_pool(10, 20);
    // TestClass test_class;
    // for (int i = 0; i < 40; i ++)
    //     thread_pool.add_task(&test_class);

    // sleep(4);
    // for (int i = 0; i < 100; i ++)
    //     thread_pool.add_task(&test_class);

    return 0;
}