#!/bin/bash
cd /home/z/my-project
while true; do
    bun run dev >> /home/z/my-project/dev.log 2>&1
    echo "Server crashed, restarting in 2 seconds..." >> /home/z/my-project/dev.log
    sleep 2
done
