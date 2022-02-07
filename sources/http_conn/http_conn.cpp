#ifndef HTTP_CONN_CPP
#define HTTP_CONN_CPP

#include "http_conn.h"
#include "debugger.h"
#include <sys/epoll.h>
#include <unistd.h>
#include <fcntl.h>
#include <exception>

int HttpConn::epfd = -1;
Router *HttpConn::root = nullptr;

void HttpConn::init(int fd) {
    Debug("%d", fd);
    this->fd = fd;
    response.init(fd);
    fcntl(fd, F_SETFL, fcntl(fd, F_GETFL) | O_NONBLOCK);
    add_fd();
}

void HttpConn::handle(HTTPCONN_HANDLE httpconn_handle) {
    switch (httpconn_handle) {
        case RECV_REQUEST: {
            Debug("HttpConn::handle(RECV_REQUEST) is call");
            read();
            break;
        }
        
        case SEND_RESPONSE: {
            Debug("HttpConn::handle(SEND_RESPONSE) is call");
            write();
            break;
        }

        default: {
            break;
        }
    }
}

void HttpConn::disconnect() {
    Debug("HttpConn::disconnect() is call, %d", fd);
    del_fd();
    close(fd);
    fd = -1;
}

HttpConn::~HttpConn() {
    if (fd == -1) return;
    disconnect();
}

void HttpConn::read() {
    auto ret = request.parse(fd);
    switch (ret) {
        case NO_REQUEST:
            response.set_code(400);
            break;
        case INTERNAL_ERROR:
            response.set_code(500);
            break;
        case FORBIDDEN_REQUEST:
            response.set_code(403);
            break;
        case URL_TOO_LONG:
            response.set_code(414);
            break;
        case HEADER_TOO_LONG:
            response.set_code(413);
            break;
        case PROTOCOL_ERROR:
            response.set_code(405);
            break;
        case CLOSED_CONNECTION:
            disconnect();
            return;
            break;
        case GET_REQUEST:
            if (!root->routing(request.url, request, response))
                response.set_code(404);
            break; 
        default:
            Assert(false);
            break;
    }
    mod_fd(EPOLLOUT);
}

void HttpConn::write() {
    auto ret = response.reply();
    disconnect();
}

void HttpConn::add_fd() {
    epoll_event event;
    event.data.fd = fd;
    event.events = EPOLLIN | EPOLLRDHUP | EPOLLONESHOT | EPOLLET;
    if (epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &event) == -1) {
        Debug("HttpConn::add_fd() fail");
        throw std::exception();
    }
}

void HttpConn::mod_fd(int flags) {
    epoll_event event;
    event.data.fd = fd;
    event.events = flags | EPOLLRDHUP | EPOLLONESHOT | EPOLLET;
    if (epoll_ctl(epfd, EPOLL_CTL_MOD, fd, &event) == -1) {
        Debug("HttpConn::mod_fd() fail");
        throw std::exception();
    }
}

void HttpConn::del_fd() {
    if (epoll_ctl(epfd, EPOLL_CTL_DEL, fd, NULL)) {
        Debug("HttpConn::del_fd() fail");
        throw std::exception();
    }
}

#endif