#ifndef HTTP_RESPONSE_CODE_H
#define HTTP_RESPONSE_CODE_H

enum class HTTP_RESPONSE_DATA_TYPE {
    DEFAULT,
    CUSTOM,
    DOCUMENT
};

enum class HTTP_RESPONSE_CODE {
    SEND_RESPONSE_OVER,
    SEND_RESPONSE_OPEN,
    SEND_RESPONSE_ERROR,
    CONNECT_CLOSED
};

const char *get_title(int code); 

extern const char *default_format;

#endif