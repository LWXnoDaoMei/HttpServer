#ifndef LOCKER_CPP
#define LOCKER_CPP

#include "locker.h"

Locker::Locker() {
    pthread_mutex_init(&mutex, NULL);
}

void Locker::lock() {
    pthread_mutex_lock(&mutex);
}

void Locker::unlock() {
    pthread_mutex_unlock(&mutex);
}

pthread_mutex_t &Locker::get_mutex() {
    return mutex;
}

Locker::~Locker() {
    pthread_mutex_destroy(&mutex);
}

#endif