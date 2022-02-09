#ifndef LOCK_VAR_H
#define LOCK_VAR_H

#include "locker.h"

template<typename var_t = int>
class LockVar {
public:

    Locker locker;

    var_t var;

    template<typename... Args>
    LockVar(Args &&...args);

};

template<typename var_t>
template<typename...Args>
LockVar<var_t>::LockVar(Args &&...args) : var(args...) {

}

#endif