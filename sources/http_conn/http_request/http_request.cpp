#ifndef HTTP_REQUEST_CPP
#define HTTP_REQUEST_CPP

#include "http_request.h"
#include "debugger.h"
#include <sys/socket.h>
#include <exception>
#include <algorithm>

using namespace std;

HttpRequest::HttpRequest() {

}

HTTP_REQUEST_CODE HttpRequest::parse(int fd) {
    init(fd);
    /*modfity don't use while*/
    while (parse_state != PARSE_OVER) {
        switch (parse_state) {
            case PARSE_LINE: {
                if (!parse_line()) return request_code;
                break;
            }

            case PARSE_HEADER: {
                if (!parse_header()) return request_code;
                break;
            }

            case PARSE_DATA: {
                if (!parse_data()) return request_code;
                break;
            }
        }
    }    
    Debug("parse success %d", fd);
    return request_code = GET_REQUEST;
}

HttpRequest::~HttpRequest() {

}

void HttpRequest::init(int _fd) {
    fd = _fd;

    host.clear();
    content_type.clear();
    connection.clear();

    buf[BUFSIZ] = '\0';
    len = idx = 0;

    request_code = NO_REQUEST;
    parse_state = PARSE_LINE;
}

const char *HttpRequest::get_line() {
    if (idx >= len && !read(buf)) return "";
    line_state = LINE_OVER;
    const char *ret_val = buf + idx;
    for ( ; idx < BUFSIZ; idx ++) {
        if (buf[idx] == '\r') {
            if (idx + 1 < BUFSIZ && buf[idx + 1] == '\n') {
                buf[idx] = buf[idx + 1] = '\0';
                idx += 2;
                return ret_val;
            } else if (idx + 1 == BUFSIZ) {
                char c;
                if (!read(&c, 1, MSG_PEEK)) return ""; 
                if (c == '\n') {
                    read(&c, 1);
                    buf[idx] = '\0';
                    idx ++;
                    return ret_val;
                }
            }
        }
    }
    line_state = LINE_OPEN;
    return ret_val;
}

bool HttpRequest::read(char *buf, size_t n, int flags) {
    idx = 0;
    while (true) {
        len = recv(fd, buf, n, flags);
        if (len > 0) return true;
        if (len == 0) {
            line_state = LINE_BAD;
            request_code = CLOSED_CONNECTION;
            return false;
        }
        if (len < 0) {
            if (errno == EINTR) continue;
            else if (errno == EAGAIN) {
                line_state = LINE_BAD;
                request_code = NO_REQUEST;
                return false;
            } else {
                Debug("HttpRequest::get_line() : recv() fail");
                throw std::exception();
            }
        }
    } 
    return false;
}

bool HttpRequest::parse_line() {
    std::string line = get_line();
    if (line_state == LINE_OPEN) {
        request_code = URL_TOO_LONG;
        return false;
    }
    if (line_state == LINE_BAD) {
        return false;
    }

    Debug("%s", line.c_str());

    auto first_space_pos = line.find_first_of(' ');
    auto second_space_pos = line.find(' ', first_space_pos + 1);
    if (first_space_pos == std::string::npos || second_space_pos == std::string::npos) {
        Debug("1");
        request_code = NO_REQUEST;
        return false;
    }

    auto _method = line.substr(0, first_space_pos);
    if (_method == "GET") method = GET;
    else if (_method == "POST") method = POST;
    else {
        request_code = METHOD_ERROR;
        Debug("method error");
        return false;
    }

    protocol = line.substr(second_space_pos + 1);
    if (protocol != "HTTP/1.1") {
        request_code = PROTOCOL_ERROR;
        Debug("protocol error");
        return false;
    }

    url = line.substr(first_space_pos + 1, second_space_pos - first_space_pos - 1);
    Debug("%s %d", url.c_str(), fd);

    parse_state = PARSE_HEADER;
    return true;
}

bool HttpRequest::parse_header() {
    std::string header = get_line();
    if (line_state == LINE_OPEN) header += get_line();
    if (line_state == LINE_BAD) {
        request_code = NO_REQUEST;
        return false;
    }
    if (line_state == LINE_OPEN || header.length() > BUFSIZ) {
        request_code = HEADER_TOO_LONG;
        return false;
    }

    if (!header.length()) {
        parse_state = PARSE_DATA;
        return true;
    }

    header.erase(remove(header.begin(), header.end(), ' '), header.end());
    auto pos = header.find_first_of(':');
    if (pos == std::string::npos || pos + 1 >= header.length()) {
        request_code = NO_REQUEST;
        return false;
    }
    auto key = header.substr(0, pos);
    if (key == "Content-Type:") content_type = header.substr(pos + 1);
    else if (key == "Host:") host = header.substr(pos + 1);
    else if (key == "Connection") connection = header.substr(pos + 1);

    return true;
}

bool HttpRequest::parse_data() {
    if (!content_type.length()) {
        parse_state = PARSE_OVER;
        return true;
    }
    const char *data_str;
    while (data_str = get_line()) {
        Debug("%s", data_str);
    }
    parse_state = PARSE_OVER;
    return true;
}

#endif