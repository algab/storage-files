FROM ubuntu:18.10

LABEL maintainer "Álvaro Oliveira <alvarogab6@gmail.com>"

WORKDIR /home/node/app

ENV TZ=America/Sao_Paulo

ENV PORT=8080

COPY package*.json ./

RUN apt-get -y update && apt-get -y install nodejs && apt-get -y install npm 

RUN apt-get -y install sqlite3 && apt-get -y upgrade

RUN npm install

COPY . .

EXPOSE 8080

RUN sqlite3 data/storage.db < storage.sql

CMD ["npm","start"]

VOLUME /home/node/app/data