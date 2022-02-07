#ifndef HTTP_RESPONSE_CODE_CPP
#define HTTP_RESPONSE_CODE_CPP

#include "http_response_code.h"
#include "debugger.h"

const char *get_title(int code) {
    switch (code) {
        case 200:
            return "200 OK";
        case 400:
            return "400 Bad Request";
        case 403:
            return "403 Forbidden";
        case 404:
            return "404 Not Found";
        case 405:
            return "405 Method Forbid";
        case 413:
            return "413 Request Too big";
        case 414:
            return "414 URL Too Long"; 
        case 500:
            return "500 Internal Error";
        default:
            Assert(false);
            return "";
    }
}

const char *default_format = ""\
"<html>\n"\
"<head>\n"\
"   <title>\n"\
"       %s\n"\
"  </title>\n"\
"</head>\n"\
"<body>\n"\
"    <h1 style=\"text-align: center;\">404 Not Found</h1>\n"\
"   <hr style=\"border: solid;\">\n"\
"   <div style=\"text-align: center;\">\n"\
"       %s\n"\
"   </div>\n"\
"</body>\n"\
"</html>\n";

#endif