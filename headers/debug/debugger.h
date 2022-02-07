#ifndef DEBUGGER_H
#define DEBUGGER_H

#ifdef DEBUG
#include <cassert>
void debug(const char *_format, const char * _args, ...); 
#define Debug(format, args...) debug(format, #args, ##args);
#define Assert(x) assert(x)
#else
#define Debug(format, args...)
#define Assert(x)
#endif

#endif