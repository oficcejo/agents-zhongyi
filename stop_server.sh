#!/bin/bash
# 停止占用8000端口的进程

# 查找占用8000端口的进程
PID=$(lsof -ti:8000)

if [ -z "$PID" ]; then
    echo "端口8000没有被占用"
else
    echo "找到占用端口8000的进程: $PID"
    kill -9 $PID
    echo "已停止进程 $PID"
fi

