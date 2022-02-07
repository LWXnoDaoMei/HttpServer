#ifndef HTTP_SERVER_H
#define HTTP_SERVER_H

#include "http_conn.h"
#include <sys/epoll.h>

typedef short int port_t;
typedef const char *ip_t;

class HttpServer {
public:

    Router root;

    HttpServer(ip_t ip, port_t port, int max_fd_count = 1024);
    ~HttpServer();

    void run();

private:

    int epfd = -1, lfd = -1, max_fd_count = 0;
    epoll_event *events;
    HttpConn *users;

    void init();
};


#endif