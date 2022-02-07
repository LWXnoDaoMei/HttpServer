#ifndef ROUTER_H
#define ROUTER_H

#include "http_request.h"
#include "http_response.h"
#include <vector>
#include <functional>

class Router {
public:
    void add_router(const char *url, Router &router);
    void add_func(const char *url, std::function<void (HttpRequest &, HttpResponse &)> func);
    bool routing(const std::string &url, HttpRequest &request, HttpResponse &response);

private:

    std::vector<std::pair<std::string, Router *>> routers;    
    std::vector<std::pair<std::string, std::function<void (HttpRequest &, HttpResponse &)>>> funcs;

};

#endif