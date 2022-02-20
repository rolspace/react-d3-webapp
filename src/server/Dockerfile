FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY . .
RUN npm install --production --silent
EXPOSE 9000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
