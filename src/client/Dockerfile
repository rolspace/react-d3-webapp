FROM node:lts-alpine as intermediate

ENV APPLICATION_ID=application_id
ENV NODE_ENV=production
ENV SERVER_URL=http://serverurl

WORKDIR /usr/src/app
COPY . .
RUN cd public && rm -rf ./dist && cd /usr/src/app \
    && npm install --silent --production=false && npm run build

FROM alpine
RUN apk add thttpd && adduser -D static
USER static
WORKDIR /home/static
COPY --from=intermediate /usr/src/app/public .
EXPOSE 8000
CMD ["thttpd", "-D", "-h", "0.0.0.0", "-p", "8000", "-d", "/home/static", "-u", "static", "-l", "-", "-M", "60"]
