FROM node:9.3.0

LABEL maintainer "Álvaro Oliveira <alvarogab6@gmail.com>"

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm","start"]
