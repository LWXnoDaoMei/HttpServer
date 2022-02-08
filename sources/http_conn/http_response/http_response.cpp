#ifndef HTTP_RESPONSE_CPP
#define HTTP_RESPONSE_CPP

#include "http_response.h"
#include "debugger.h"
#include <sys/socket.h>
#include <unistd.h>
#include <cstring>

void HttpResponse::init(int fd) {
    this->fd = fd;
    code = 200;
    header.clear();
    data_custom.clear();
    doc = nullptr;
    data_type = HTTP_RESPONSE_DATA_TYPE::DEFAULT;
    response_code = HTTP_RESPONSE_CODE::SEND_RESPONSE_OVER;
}

void HttpResponse::set_code(int code) {
    this->code = code;
}

void HttpResponse::add_header(const char *key, const char *value) {
    header.append(key);
    header.append(": ");
    header.append(value);
    header.append("\r\n");
}

void HttpResponse::set_data(Document *_doc) {
    data_type = HTTP_RESPONSE_DATA_TYPE::DOCUMENT;
    doc = _doc;
}

HTTP_RESPONSE_CODE HttpResponse::reply() {
    switch (data_type) {
        case HTTP_RESPONSE_DATA_TYPE::DEFAULT:
            reply_default();
            break; 
        case HTTP_RESPONSE_DATA_TYPE::CUSTOM:
            reply_custom();
            break;
        case HTTP_RESPONSE_DATA_TYPE::DOCUMENT:
            reply_document();
            delete doc;
            break;
        default:
            Assert(false);
    }
    return response_code;
}

bool HttpResponse::reply_default() {
    if (!write_line()) return false;
    add_header("Connection", "close");
    if (!write_header()) return false; 
    const char *title = get_title(code);
    sprintf(buf, default_format, title, title);
    return write(buf, strlen(buf));
}

bool HttpResponse::reply_custom() {
    return false;
}

bool HttpResponse::reply_document() {
    Assert(doc);
    if (!write_line()) return false;
    add_header("Connection", "close");
    add_header("Content-Type", doc->get_content_type());
    if (!write_header()) return false;
    size_t len = -1;
    const char *addr = doc->get_addr(len);
    return write(addr, len);
}

bool HttpResponse::write(const char *buf, size_t n) {
    size_t tot_len = n;
    while (n) {
        ssize_t len = send(fd, buf + tot_len - n, n, 0);
        Debug("%d", len);
        if (len == 0) {
            response_code = HTTP_RESPONSE_CODE::CONNECT_CLOSED;
            return false;
        }
        if (len == -1) {
            if (errno == EINTR || errno == EAGAIN) {
                usleep(20000); 
                continue;
            }
            response_code == HTTP_RESPONSE_CODE::SEND_RESPONSE_ERROR;
            Debug("HttpResponse::write() is error, %b", errno == EPIPE);
            return false;
        }        
        n -= len;
    }
    response_code = HTTP_RESPONSE_CODE::SEND_RESPONSE_OVER;
    return true;
}

bool HttpResponse::write_line() {
    line = "HTTP/1.1 ";
    line.append(get_title(code));
    line.append("\r\n");
    return write(line.c_str(), line.length());
}

bool HttpResponse::write_header() {
    if (header.length() && !write(header.c_str(), header.length())) {
        return false;
    }
    return write("\r\n", 2);
}

#endif