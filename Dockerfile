FROM node:9.3.0

LABEL maintainer "Álvaro Oliveira <alvarogab6@gmail.com>"

WORKDIR /home/node/app

ENV TZ=America/Sao_Paulo

COPY package*.json ./

RUN apt-get update && apt-get install sqlite3

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm","start"]

RUN sqlite3 storage.db < storage.txt

VOLUME /home/node/app/data
