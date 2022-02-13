#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include "cycle_queue.h"
#include "locker.h"
#include "sem.h"
#include "condition.h"
#include "debugger.h"
#include <unistd.h>
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

    static const int ADJUST_WAIT_TIME = 60;
    static const int THREAD_ADD_STEP = 10;

    Cond count_zero;
    Cond adjust;

    CycleQueue<var_t *> tasks;
    Sem tasks_sem;
    Locker locker;

    int min_count, max_count, count, buzy_count, destrory_count; 
    bool is_shutdown;

    bool use_adjust;

    void create_task_thread(int count);

    void create_adjust_thread();
};

template<typename var_t>
ThreadPool<var_t>::ThreadPool(int _min_count, int _max_count) : tasks_sem(0, false) {
    Assert(_min_count <= _max_count);
    min_count = _min_count, max_count = _max_count;
    count = buzy_count = destrory_count = 0;
    is_shutdown = false;
    use_adjust = (min_count != max_count);
    create_task_thread(min_count);
    if (use_adjust) create_adjust_thread();
}

template<typename var_t>
void ThreadPool<var_t>::add_task(var_t *task) {
    locker.lock();
    tasks.push(task);
    if (use_adjust && tasks.size() + buzy_count > count - destrory_count && max_count > count - destrory_count) adjust.signal();
    locker.unlock();
    tasks_sem.post();
}

template<typename var_t>
void ThreadPool<var_t>::task_thread_handle() {
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
            if (destrory_count) {
                destrory_count --;
                if (-- count == 0) count_zero.signal();
                locker.unlock();
                return;
            };
        } while (true);
    }
}

inline int min(int v1, int v2) {
    return v1 < v2 ? v1 : v2;
}

template<typename var_t>
void ThreadPool<var_t>::adjust_thread_handle() {
    locker.lock();
    while (true) {
        adjust.timewait(ADJUST_WAIT_TIME, locker.get_mutex());
        if (is_shutdown) {
            if (count == 0) {
                locker.unlock();
                Debug("adjust thread exit");
                break;
            } else if (tasks.size() == 0) {
                destrory_count = count;
                for (int i = 0; i < count; i ++)
                    tasks_sem.post();
                adjust.set_var(true);
                locker.unlock();
                sleep(1);
                locker.lock();
                continue;
            }
        }
        int cnt = tasks.size() + buzy_count - count + destrory_count;
        int thread_add_cnt = (cnt / THREAD_ADD_STEP + 1) * THREAD_ADD_STEP;
        thread_add_cnt = min(thread_add_cnt, max_count - count);
        if (thread_add_cnt > 0) {
            if (destrory_count) {
                int del_cnt = min(thread_add_cnt, destrory_count);
                thread_add_cnt -= del_cnt;
                destrory_count -= del_cnt;
            }
            create_task_thread(thread_add_cnt);
        } else if (cnt < 0 && -cnt * 4 >= count * 3) {
            int _destrory_count = count - (buzy_count + tasks.size()) * 2;
            Assert(_destrory_count >= destrory_count);
            for (int i = _destrory_count - destrory_count; i; i --)
                tasks_sem.post();
            destrory_count = _destrory_count;
        }
    }
}

template<typename var_t>
ThreadPool<var_t>::~ThreadPool() {
    Debug("ThreadPool<var_t>::~ThreadPool() is call");
    locker.lock();
    is_shutdown = true;
    adjust.signal();
    // count_zero.wait(locker.get_mutex());
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
void ThreadPool<var_t>::create_task_thread(int _count) {
    if (_count < 0) {
        printf("the count of create tasks count less than zero");
        throw std::exception();
    }
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