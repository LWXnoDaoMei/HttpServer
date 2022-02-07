#ifndef HTTP_REQUEST_CODE_H
#define HTTP_REQUEST_CODE_H

/*
    http request return codes:

    NO_REQUEST           : the request is not complete
    GET_REQUEST         : recv the whole request
    NO_RESOURCE          : don't have the resource
    FORBIDDEN_REQUEST    : don't have the permission
    INTERNAL_ERROR       : internal error
    CLOSED_CONNECTION    : connection is already disconnect
    URL_TOO_LONG         : url's length exceed handle range
    HEADER_TOO_LONG      : header's length exceed handle range
    METHOD_ERROR         : method of request is not support
    PROTOCOL_ERROR       : protocol of request is not support

*/
enum HTTP_REQUEST_CODE {
    NO_RESOURCE,
    INTERNAL_ERROR,
    FORBIDDEN_REQUEST,
    CLOSED_CONNECTION,
    NO_REQUEST,
    GET_REQUEST,
    URL_TOO_LONG,
    HEADER_TOO_LONG,
    METHOD_ERROR,
    PROTOCOL_ERROR
};


enum METHOD {
    GET,
    POST
};

#endif