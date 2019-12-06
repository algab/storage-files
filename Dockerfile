FROM ubuntu:18.10

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

RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["npm","start"]

VOLUME /home/node/app/data