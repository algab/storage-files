require('dotenv').config();

const express = require('express');

const app = express();

const server = require('http').Server(app);
const socket = require('socket.io')(server);
const winston = require('./config/winston');

app.set('version', '/v1');

app.use(express.json());
app.use(require('cors')());
app.use(require('helmet')({ noSniff: false }));

app.use((req, res, next) => {
    req.socket = socket;
    next();
});
app.use((req, res, next) => {
    req.winston = winston;
    next();
});

require('./api')(app);

(async () => {
    await server.listen(process.env.PORT);
    console.log(`API Running on Port ${process.env.PORT}`);
})();
