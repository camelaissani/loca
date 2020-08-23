FROM node:12-stretch

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
RUN echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
RUN apt-get update -qq && \
    apt-get upgrade -qqy && \
    apt-get install -qqy mongodb-org-tools

WORKDIR /usr/app
COPY backend backend
COPY bkp/demodb bkp/demodb
COPY config config
COPY frontend frontend
COPY scripts scripts
COPY LICENSE .
COPY package.json .
COPY package-lock.json .
COPY server.js .

RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install forever -g --silent  && \
    npm ci && \
    npm run buildprod && \
    NODE_ENV=production npm prune

CMD forever ./server.js
