require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const server = require('http').Server(app);
const socket = require('socket.io')(server);
const winston = require('./config/winston');

app.set('version', '/v1');

app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json());
app.use(require('cors')());
app.use(require('helmet')({ noSniff: false }));

app.use((req, res, next) => {
  app.locals.socket = socket;
  next();
});
app.use((req, res, next) => {
  app.locals.winston = winston;
  next();
});

require('./api')(app);

(async () => {
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
  }
  await server.listen(process.env.PORT);
  console.log(`API Running on Port ${process.env.PORT}`);
})();
