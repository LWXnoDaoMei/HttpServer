#ifdef DEBUG
#include "debugger.h"
#include <stdarg.h>
#include <cstdio>
#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;

void debug(const char *_format, const char * _args, ...) {
    string args(_args);
    args += ',';
    args.erase(remove(args.begin(), args.end(), ' '), args.end());
    size_t args_last = 0, args_pos = 0;

    stringstream stream;
    stream << "debug: ";
    string str(_format);
    size_t last = 0, pos = 0;
    va_list li;
    va_start(li, _args);
    while ((pos = str.find('%', last)) != string::npos) {
        if ((args_pos = args.find(',', args_last)) == string::npos) break;
        string arg_name = args.substr(args_last, args_pos - args_last) + "=";
        if (last < pos) stream << str.substr(last, pos - last);
        if (pos + 1 < str.size()) {
            last = pos + 2;
            size_t _args_last = args_last;
            args_last = args_pos + 1;
            auto c = str[pos + 1];
            if (c == 'd') stream << arg_name << va_arg(li, long long);
            else if (c == 'u') stream << arg_name << va_arg(li, unsigned long long);
            else if (c == 's') stream << arg_name << '\"' << va_arg(li, const char *) << '\"';
            else if (c == 'b') stream << arg_name << (va_arg(li, int) ? "true" : "false");
            else {
                stream << '%';
                last = pos + 1;
                args_last = _args_last;
            }
        }
    }    
    if (last != str.size()) stream << str.substr(last);
    printf("%s\n", stream.str().c_str());
}

#endif