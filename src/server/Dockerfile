FROM node:18-alpine

ENV APPLICATION_ID=12345
ENV APPLICATION_SECRET=abcde
ENV CLIENT_URL=http://clienturl
ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY . .
RUN chown -R node /usr/src/app
USER node
RUN yarn --immutable
EXPOSE 9000
CMD ["yarn", "start"]
