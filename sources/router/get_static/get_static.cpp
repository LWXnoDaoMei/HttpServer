#ifndef GET_STATIC_CPP
#define GET_STATIC_CPP

#include "get_static.h"

void get_static(HttpRequest &request, HttpResponse &response) {
    auto &url = request.url;
    Document *doc = new Document(url.c_str() + 1);
    if (!doc->is_open()) {
        response.set_code(404);
        return;
    }
    response.set_data(doc);
}

#endif