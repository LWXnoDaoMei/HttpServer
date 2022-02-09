#ifndef LOCKER_H
#define LOCKER_H

#include <pthread.h>

class Locker {
public:

    Locker();

    void lock();

    void unlock();

    pthread_mutex_t &get_mutex();

    ~Locker();

private:

    pthread_mutex_t mutex;

};

#endif