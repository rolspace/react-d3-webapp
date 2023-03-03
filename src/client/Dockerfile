FROM node:lts-alpine as intermediate

ARG application_id=12345abcde
ENV APPLICATION_ID=$application_id

ARG node_env=production
ENV NODE_ENV=$node_env

ARG server_url=http://serverurl
ENV SERVER_URL=$server_url

WORKDIR /usr/src/app
COPY . .
RUN cd public && rm -rf ./dist && cd /usr/src/app \
    && npm install --silent --production=false && npm run build

# This is mostly done as a demonstration.
# In a real production environment, the better choice would be to use
# a common cloud resource for hosting static web sites, such as AWS S3.
FROM nginx:alpine
COPY --from=intermediate /usr/src/app/nginx.conf /etc/nginx/nginx.conf
COPY --from=intermediate /usr/src/app/public /usr/share/nginx/html
