#ifndef HTTP_CONN_H
#define HTTP_CONN_H

#include "router.h"

enum HTTPCONN_HANDLE { RECV_REQUEST, SEND_RESPONSE };

class HttpConn {
public:

    static int epfd;
    static Router *root;

    int fd = -1;

    HTTPCONN_HANDLE httpconn_handle;

    void init(int fd);

    void handle();

    void disconnect();

    ~HttpConn();

private:

    HttpRequest request;
    HttpResponse response;    

    void read();
    
    void write();

    void add_fd();

    void mod_fd(int flags);

    void del_fd();
};

#endif