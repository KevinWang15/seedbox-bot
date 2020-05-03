FROM alpine:3 as build-env

RUN apk add --upgrade nodejs npm alpine-sdk python

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
COPY --from=build-env /build/production-bundle /production
COPY --from=build-env /build/bot/node_modules /production/bot/node_modules
COPY --from=build-env /build/server/node_modules /production/server/node_modules
RUN apk add nodejs npm
RUN npm install -g pm2 sequelize-cli
WORKDIR /production
RUN mkdir torrents
RUN chmod -R 777 torrents bot
WORKDIR /production
ADD ./process.yml /production
CMD ["pm2-runtime", "process.yml"]
