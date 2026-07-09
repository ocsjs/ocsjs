#!/bin/sh

rm /tmp/.X*-lock
echo $VNC_PASSWORD | vncpasswd -f > /root/.vnc/passwd
chmod 600 /root/.vnc/passwd
Xvnc $DISPLAY -PasswordFile /root/.vnc/passwd -geometry "${SCREEN_WIDTH}x${SCREEN_HEIGHT}" &

chromium \
    --user-data-dir=/data \
    --no-sandbox --disable-dev-shm-usage --no-first-run \
    --disable-extensions-except=/tampermonkey --load-extension=/tampermonkey \
    --remote-debugging-port=19222 \
    --window-position=0,0 "--window-size=${SCREEN_WIDTH},${SCREEN_HEIGHT}" &
sleep 2s
node init.mjs