#ifndef SEM_CPP
#define SEM_CPP

#include "sem.h"
#include <cstdio>
#include <exception>

Sem::Sem(unsigned int value, bool pshared) {
    if (sem_init(&sem, (int)pshared, value) == -1) {
        printf("sem init fail\n");
        throw std::exception();
    }
}

void Sem::post() {
    sem_post(&sem);
}

void Sem::wait() {
    sem_wait(&sem);
}

Sem::~Sem() {
    sem_destroy(&sem);
}

#endif