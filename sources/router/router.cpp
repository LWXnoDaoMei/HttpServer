#ifndef ROUTER_CPP
#define ROUTER_CPP

#include "router.h"

void Router::add_router(const char *url, Router &router) {
    routers.emplace_back(url, &router);
}

void Router::add_func(const char *url, std::function<void (HttpRequest &, HttpResponse &)> func) {
    funcs.emplace_back(url, func);
}

bool Router::routing(const std::string &url, HttpRequest &request, HttpResponse &response) {
    if (!url.length()) return false;
    auto pos = url.find_first_of('/');
    auto key = (pos != std::string::npos ? url.substr(1) : url.substr(1, pos - 1));
    for (auto &e : funcs) {
        if (e.first == key) {
            e.second(request, response);
            return true;
        }
    }
    if (pos == std::string::npos) return false;
    for (auto &e : routers)
        if (e.first == key) 
            return e.second->routing(url.substr(pos), request, response);
    return false;
}

#endif