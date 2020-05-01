FROM ubuntu:xenial as build-env
RUN apt update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
ADD . /build
RUN npm i -g babel-cli
WORKDIR /build
RUN npm i
WORKDIR /build/bot
RUN npm i
WORKDIR /build/server
RUN npm i
WORKDIR /build/ui
RUN npm i
WORKDIR /build
RUN npm run bundle

FROM alpine:3
COPY --from=build-env /build/production-bundle /production-bundle
RUN apk add nodejs npm
RUN npm install -g pm2 forever sequelize-cli
WORKDIR /production-bundle
RUN mkdir torrents
RUN chmod -R 777 torrents bot
WORKDIR /production-bundle/bot
RUN npm i --production
WORKDIR /production-bundle/server
RUN npm i --production
WORKDIR /production-bundle

ADD ./process.yml /production-bundle
CMD ["pm2-runtime", "process.yml"]
