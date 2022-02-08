#include "http_server.h"
#include "get_static.h"
#include <signal.h>

HttpServer *server = nullptr;

void on_exit(int sig_num) {
    delete server;
    exit(0);
}

int main() {
    signal(SIGINT, on_exit);
    server = new HttpServer("101.200.142.161", 23333);
    server->root.add_func("static", get_static);
    server->run();

    return 0;
}