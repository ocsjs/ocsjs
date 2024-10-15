FROM node:22-alpine3.19

ENV DISPLAY=:0
ENV SCREEN_WIDTH=1280
ENV SCREEN_HEIGHT=720
ENV VNC_PASSWORD=password
ENV LANGUAGE=zh-CN
ENV STARTUP_URL=https://docs.ocsjs.com/
ENV TZ=Asia/Shanghai

# 安装依赖
RUN apk add --no-cache wget unzip tigervnc chromium chromium-lang font-noto-cjk tzdata

# 下载 Tampermonkey
RUN ["wget", "-O", "/tampermonkey.crx", "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=125.0.6422.112&acceptformat=crx2,crx3&x=id%3Ddhdgffkkebhmkfjojejmpbldmpobfkfo%26uc"]
RUN unzip /tampermonkey.crx -d /tampermonkey || true
RUN rm /tampermonkey.crx

RUN mkdir /root/.vnc

WORKDIR /docker

COPY docker/package.json /docker/package.json
RUN npm install

COPY docker/entrypoint.sh /docker/
COPY docker/init.mjs /docker/
COPY docker/preferences.json /data/Default/Preferences

ENTRYPOINT [ "/docker/entrypoint.sh" ]