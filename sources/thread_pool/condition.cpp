#ifndef CONDITION_CPP
#define CONDITION_CPP

#include "condition.h"
#include "debugger.h"

Cond::Cond(bool _var) : var(_var) {
    pthread_cond_init(&cond, NULL);
}

void Cond::wait(pthread_mutex_t &mutex) {
    while (!var) {
        pthread_cond_wait(&cond, &mutex);
    }
    var = false;
}

void Cond::timewait(time_t s, pthread_mutex_t &mutex) {
    if (var) {
        var = false;
        return;
    }
    struct timespec time;
    clock_gettime(CLOCK_REALTIME, &time);
    time.tv_sec += s;
    pthread_cond_timedwait(&cond, &mutex, &time);
}

void Cond::signal() {
    var = true;
    pthread_cond_signal(&cond);
}

void Cond::broadcast() {
    pthread_cond_broadcast(&cond);
}

void Cond::set_var(bool flag) {
    var = flag;
}

Cond::~Cond() {
    pthread_cond_destroy(&cond);
}

#endif