#ifndef DOCUMENT_CPP
#define DOCUMENT_CPP

#include "document.h"
#include <cstring>
#include <unistd.h>
#include <sys/types.h>
#include <sys/fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>

#define min(x, y) ((x) < (y) ? (x) : (y))

Document::Document(const char *path) : fd(-1), addr(nullptr) {
    struct stat s;
    int ret = stat(path, &s);
    if (ret == -1 || !S_ISREG(s.st_mode)) return;
    if ((fd = open(path, O_RDONLY)) == -1) return;
    memory_size = s.st_size; 

    const char *suffix = strrchr(path, '.');
    if (!strcmp(suffix, ".png")) content_type = "image/png";
    else if (!strcmp(suffix, ".jpg")) content_type = "image/jpg";
    else if (!strcmp(suffix, "gif")) content_type = "image/gif";
    else if (!strcmp(suffix, ".html")) content_type = "text/html; charset=utf-8";
    else if (!strcmp(suffix, ".pdf")) content_type = "application/pdf; charset=utf-8";
    else content_type = "text/plain; charset=utf-8";
}

bool Document::is_open() {
    return fd != -1;
}

const char *Document::get_addr(size_t &n, size_t offset) {
    if (fd == -1 || offset >= memory_size) return nullptr;
    if (addr) munmap((void *)addr, map_length);
    n = min(n, memory_size - offset);
    addr = (const char *)mmap(NULL, n, PROT_READ, MAP_PRIVATE, fd, offset);
    map_length = n;
    return addr;
}

const char *Document::get_content_type() {
    return content_type;
}

size_t Document::get_memory_size() {
    return memory_size;
}

Document::~Document() {
    if (addr) munmap((void *)addr, map_length);
}

#endif