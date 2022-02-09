#ifndef CYCLE_QUEUE_H
#define CYCLE_QUEUE_H

template<typename var_t>
class CycleQueue {
public:

    CycleQueue(unsigned int _max_sz = -1);

    bool push(var_t &var);

    var_t pop();

    var_t front();

    void reserve(unsigned int _size);

    int size();

    ~CycleQueue();

private:

    unsigned int max_sz, container_sz, begin, end;
    int sz;
    var_t *vars;

    void resize(int _sz);

};


#include "debugger.h"
#include <algorithm>

template<typename var_t>
CycleQueue<var_t>::CycleQueue(unsigned int _max_sz) {
    max_sz = _max_sz;
    begin = end = 0;
    sz = 0;
    container_sz = 1;
    vars = new var_t[1];
}

template<typename var_t>
bool CycleQueue<var_t>::push(var_t &var) {
    if (sz == max_sz) return false;
    if (sz == container_sz) resize(container_sz * 2);
    sz ++;
    vars[end ++] = var;
    if (end == container_sz) end = 0;
    return true;
}

template<typename var_t>
var_t CycleQueue<var_t>::pop() {
    Assert(sz > 0);
    sz --;
    auto &temp = vars[begin ++];
    if (begin == container_sz) begin = 0;
    return temp;
}

template<typename var_t>
var_t CycleQueue<var_t>::front() {
    Assert(sz > 0);
    return vars[begin];
}

template<typename var_t>
void CycleQueue<var_t>::reserve(unsigned int _size) {
    if (_size <= container_sz) return;
    _size = std::min((unsigned int)1 << std::__lg(_size) + 1, max_sz);
    resize(_size);
}

template<typename var_t>
int CycleQueue<var_t>::size() {
    return sz;
}

template<typename var_t>
CycleQueue<var_t>::~CycleQueue() {
    delete[] vars;
}

template<typename var_t>
void CycleQueue<var_t>::resize(int _sz) {
    var_t *_vars = new var_t[_sz];
    for (int i = begin, j = 0; j < sz; i ++, j ++) {
        if (i == container_sz) i = 0;
        _vars[j] = vars[i];
    }
    begin = 0, end = sz;
    container_sz *= 2;
    delete[] vars;
    vars = _vars;
}

#endif