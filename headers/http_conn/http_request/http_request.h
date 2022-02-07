#ifndef HTTP_REQUEST_H
#define HTTP_REQUEST_H

#include "http_request_code.h"
#include <string>

#define BUFSIZE 8192

class HttpRequest {
public:

    /*request line*/
    METHOD method;
    std::string url;
    std::string protocol;

    /*request header*/
    std::string host;
    std::string content_type;
    std::string connection;

    /*request data*/


    HttpRequest();

    HTTP_REQUEST_CODE parse(int fd);

    ~HttpRequest();
    
private:

    enum LINE_STATE { LINE_OVER, LINE_OPEN, LINE_BAD };
    enum PARSE_STATE { PARSE_LINE, PARSE_HEADER, PARSE_DATA, PARSE_OVER };

    LINE_STATE line_state;
    PARSE_STATE parse_state;
    HTTP_REQUEST_CODE request_code;

    char buf[BUFSIZ + 1];
    int len, idx;

    int fd;

    void init(int fd);

    const char *get_line();

    bool read(char *buf, size_t n = BUFSIZ, int flags = 0);

    bool parse_line();
    
    bool parse_header();

    bool parse_data();

};

#endif