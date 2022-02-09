#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include "cycle_queue.h"
#include "locker.h"
#include "sem.h"
#include "condition.h"
#include "debugger.h"
#include <exception>

template<typename var_t>
class ThreadPool {
public:

    ThreadPool(int _min_count, int _max_count);

    void add_task(var_t *task);

    void task_thread_handle();

    void adjust_thread_handle();

    ~ThreadPool();

private:

    Cond count_zero;

    CycleQueue<var_t *> tasks;
    Sem tasks_sem;
    Locker locker;

    unsigned int min_count, max_count, count, buzy_count, destrory_count; 
    bool is_shutdown;

    bool use_adjust;

    void create_task_thread(unsigned int count);

    void create_adjust_thread();
};

template<typename var_t>
ThreadPool<var_t>::ThreadPool(int _min_count, int _max_count) : tasks_sem(0, false) {
    Assert(_min_count <= _max_count);
    min_count = _min_count, _max_count = _max_count;
    count = buzy_count = destrory_count = 0;
    is_shutdown = false;
    use_adjust = (min_count != max_count);
    create_task_thread(min_count);
}

template<typename var_t>
void ThreadPool<var_t>::add_task(var_t *task) {
    locker.lock();
    tasks.push(task);
    locker.unlock();
    tasks_sem.post();
}

template<typename var_t>
void ThreadPool<var_t>::task_thread_handle() {
    Debug("Thread<var_t>::task_thread_handle() is call");
    while (true) {
        tasks_sem.wait();
        locker.lock();
        do {
            if (tasks.size()) {
                auto task = tasks.pop();
                buzy_count ++;
                locker.unlock();
                task->handle();
                locker.lock();
                buzy_count --;
                locker.unlock();
                break;
            }
            if (is_shutdown) {
                destrory_count --;
                if (-- count == 0) count_zero.signal();
                locker.unlock();
                return;
            }
        } while (0);
    }
}

template<typename var_t>
void ThreadPool<var_t>::adjust_thread_handle() {
    while (true) {
        
    }
}

template<typename var_t>
ThreadPool<var_t>::~ThreadPool() {
    Debug("ThreadPool<var_t>::~ThreadPool() is call");
    locker.lock();
    is_shutdown = true;
    for (int i = 0; i < count; i ++)
        tasks_sem.post();
    while (count) {
        count_zero.wait(locker.get_mutex());
    }
    locker.unlock();
    Debug("reset thread %d", count);
}

template<typename var_t>
void *task_thread(void *arg) {
    auto thread_pool = (ThreadPool<var_t> *)arg;
    thread_pool->task_thread_handle();
    pthread_exit(0);
}

template<typename var_t>
void ThreadPool<var_t>::create_task_thread(unsigned int _count) {
    for (int i = 0; i < _count; i ++) {
        pthread_t id;
        if (pthread_create(&id, NULL, task_thread<var_t>, this) == -1) {
            printf("task thread craete fail");
            throw std::exception();
        }
        count ++;
        pthread_detach(id);
    }
}

template<typename var_t>
void *adjust_thread(void *arg) {
    auto thread_pool = (ThreadPool<var_t> *)arg;
    thread_pool->adjust_thread_handle();
    pthread_exit(0);
}

template<typename var_t>
void ThreadPool<var_t>::create_adjust_thread() {
    if (!use_adjust) return;
    pthread_t id;
    if (pthread_create(&id, NULL, adjust_thread<var_t>, this) == -1) {
        printf("adjust thread create fail");
        throw std::exception();
    }
    pthread_detach(id);
}

#endif