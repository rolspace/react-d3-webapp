FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY . .
RUN chown -R node /usr/src/app
USER node
RUN npm install --production --silent
EXPOSE 9000
CMD ["node", "index.js"]
