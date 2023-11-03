FROM node:20-alpine

WORKDIR /usr/src/app
COPY ["index.js", "package.json", "./"]
COPY data/ ./data
COPY lib/ ./lib
COPY middleware/ ./middleware
COPY routes/ ./routes

RUN chown -R node /usr/src/app
USER node
RUN npm install --ignore-scripts
EXPOSE 9000
CMD ["npm", "start"]
