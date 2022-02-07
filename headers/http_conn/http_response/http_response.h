#ifndef HTTP_RESPONSE_H
#define HTTP_RESPONSE_H

#include "http_response_code.h"
#include "document.h"
#include <string>

class HttpResponse {
public:

    void init(int fd);

    void set_code(int code);

    void add_header(const char *key, const char *value);

    void set_data(Document *_doc);

    HTTP_RESPONSE_CODE reply();

private:

    enum WRITE_STATE { WRITE_OVER, WRITE_ERROR };

    char buf[BUFSIZ];

    int fd;
    int code;
    std::string line;
    std::string header;
    std::string data_custom;
    Document *doc;
    HTTP_RESPONSE_DATA_TYPE data_type;
    HTTP_RESPONSE_CODE response_code;
    WRITE_STATE write_state;

    bool reply_default();

    bool reply_custom();

    bool reply_document();

    bool write(const char *buf, size_t n);

    bool write_line();

    bool write_header();

};

#endif