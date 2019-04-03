FROM node:8-stretch AS base
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
RUN echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
RUN apt-get update -qq && \
    apt-get upgrade -qqy && \
    apt-get install -qqy \
    mongodb-org-tools
WORKDIR /usr/app
RUN npm set progress=false && \
    npm config set depth 0
COPY . .

FROM base as dependencies
RUN npm ci && \
    npm run buildprod && \
    NODE_ENV=production npm prune

FROM base AS release
RUN npm install forever -g --silent
COPY --from=dependencies /usr/app .
EXPOSE 8081
CMD forever ./server.js
