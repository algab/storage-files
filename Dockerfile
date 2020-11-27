FROM ubuntu:20.10

WORKDIR /home/node/app

ENV TZ=America/Sao_Paulo
ENV PORT=8080
ENV ADMIN_EMAIL=
ENV ADMIN_PASS=
ENV JWT_SECRET=
ENV EMAIL_SERVICE=
ENV EMAIL_PORT=
ENV EMAIL_USER=
ENV EMAIL_PASS=
ENV HOST=

COPY package*.json ./

RUN apt-get -y update && apt-get -y install nodejs && apt-get -y install npm 

RUN apt-get -y install sqlite3 && apt-get -y upgrade

RUN npm install

COPY . .

RUN npm run migrate:run

CMD ["npm","start"]

EXPOSE 8080

VOLUME /home/node/app/data
