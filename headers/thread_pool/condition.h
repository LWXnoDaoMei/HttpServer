#ifndef CONDITION_H
#define CONDITION_H

#include <pthread.h>

class Cond {
public:

    Cond();

    void wait(pthread_mutex_t &mutex);

    void signal();

    void broadcast();

    ~Cond();

private:

    pthread_cond_t cond;

};


Cond::Cond() {
    pthread_cond_init(&cond, NULL);
}

void Cond::wait(pthread_mutex_t &mutex) {
    pthread_cond_wait(&cond, &mutex);
}

void Cond::signal() {
    pthread_cond_signal(&cond);
}

void Cond::broadcast() {
    pthread_cond_broadcast(&cond);
}

Cond::~Cond() {
    pthread_cond_destroy(&cond);
}

#endif