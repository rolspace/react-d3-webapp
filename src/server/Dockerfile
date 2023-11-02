FROM node:20-alpine

ENV APPLICATION_ID=12345
ENV APPLICATION_SECRET=abcde
ENV CLIENT_URL=http://clienturl
ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY ["index.js", "package.json", "./"]
COPY data/ ./data
COPY lib/ ./lib
COPY middleware/ ./middleware
COPY routes/ ./routes

RUN chown -R node /usr/src/app
USER node
RUN npm install
EXPOSE 9000
CMD ["npm", "start"]
