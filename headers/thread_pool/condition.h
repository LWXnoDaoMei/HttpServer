#ifndef CONDITION_H
#define CONDITION_H

#include <pthread.h>

class Cond {
public:

    Cond(bool _var = false);

    void wait(pthread_mutex_t &mutex);

    void timewait(time_t s, pthread_mutex_t &mutex);

    void signal();

    void broadcast();

    void set_var(bool flag);

    ~Cond();

private:

    pthread_cond_t cond;
    bool var;

};

#endif