// #ifndef CONDITION_CPP
// #define CONDITION_CPP

// #include "condition.h"

// Cond::Cond() {
//     pthread_cond_init(&cond, NULL);
// }

// void Cond::wait(pthread_mutex_t &mutex) {
//     pthread_cond_wait(&cond, &mutex);
// }

// void Cond::signal() {
//     pthread_cond_signal(&cond);
// }

// void Cond::broadcast() {
//     pthread_cond_broadcast(&cond);
// }

// Cond::~Cond() {
//     pthread_cond_destroy(&cond);
// }

// #endif