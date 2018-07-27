FROM node:8
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
RUN echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
RUN apt-get update -qq && \
    apt-get upgrade -qqy && \
    apt-get install -qqy \
    mongodb-org-tools nasm

WORKDIR /usr/app

COPY . .

RUN npm install --silent

EXPOSE 9229 8081 9091

CMD npm run dev