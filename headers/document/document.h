#ifndef DOCUMENT_H
#define DOCUMENT_H

#include <stddef.h>

class Document {
public:

    Document(const char *path);

    bool is_open();

    const char *get_addr(size_t &n, size_t offset = 0);

    const char *get_content_type();

    size_t get_memory_size();

    ~Document();

private:
    int fd;
    size_t memory_size;
    const char *content_type;

    const char *addr;
    size_t map_length;
};

#endif