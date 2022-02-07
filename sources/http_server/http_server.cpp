#ifndef HTTP_SERVER_CPP
#define HTTP_SERVER_CPP

#include "http_server.h"
#include "debugger.h"
#include <sys/socket.h>
#include <sys/epoll.h>
#include <netinet/in.h>
#include <unistd.h>
#include <signal.h>
#include <cstring>
#include <exception>

HttpServer::HttpServer(ip_t ip, port_t port, int max_fd_count) : max_fd_count(max_fd_count) {
    init();
    lfd = socket(PF_INET, SOCK_STREAM, 0);
    if (lfd == -1) {
        Debug("socket create fail");
        throw std::exception();
    }
    sockaddr_in sin;
    memset(&sin, 0, sizeof sin);
    sin.sin_family = AF_INET;
    sin.sin_port = htons(port);
    int opt = 1;
    if (setsockopt(lfd, SOL_SOCKET, SO_REUSEADDR, (void *)&opt, sizeof opt) == -1) {
        Debug("set refuse fail");
        throw std::exception();
    }
    if (bind(lfd, (sockaddr *)&sin, sizeof sin) == -1) {
        Debug("socket bind fail");
        throw std::exception();
    }
    if (listen(lfd, max_fd_count) == -1) {
        Debug("socket listen fail");
        throw std::exception();
    }
    epfd = epoll_create(10);
    HttpConn::epfd = epfd;
    HttpConn::root = &root;
}

void HttpServer::init() {
    events = new epoll_event[max_fd_count];
    users = new HttpConn[max_fd_count];
}

void HttpServer::run() {
    epoll_event event;
    event.events = EPOLLIN;
    event.data.fd = lfd;
    epoll_ctl(epfd, EPOLL_CTL_ADD, lfd, &event);
    signal(SIGPIPE, [](int){});
    printf("Listening...\n");
    while (true) {
        int n_ready = epoll_wait(epfd, events, max_fd_count, -1);
        for (int i = 0; i < n_ready; i ++) {
            int fd = events[i].data.fd;
            int flags = events[i].events;
            if (fd == lfd) {
                int cfd = accept(lfd, NULL, NULL);
                users[cfd].init(cfd);
            } else if (flags & EPOLLIN) {
                users[fd].handle(RECV_REQUEST);
            } else if (flags & EPOLLOUT) {
                users[fd].handle(SEND_RESPONSE); 
            } else if (flags & (EPOLLRDHUP | EPOLLHUP | EPOLLERR)) {
                Debug("disconnect");
                users[fd].disconnect();
            }
        }
    }
}

HttpServer::~HttpServer() {
    delete[] events;
    delete[] users;
    close(lfd);
    close(epfd);        

    printf("\nclose server\n");
}

#endif