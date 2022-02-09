#ifndef SEM_H
#define SEM_H

#include <semaphore.h>

class Sem {
public:

    Sem(unsigned int value, bool pshared);

    void post();

    void wait();

    ~Sem();

private:

    sem_t sem;

};

#endif