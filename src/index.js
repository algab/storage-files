require('dotenv').config();

const express = require('express');

const app = express();

const server = require('http').Server(app);

app.set('version', '/v1');
app.set('logger', require('./config/logger'));
app.set('socket', require('socket.io')(server));
app.set('database', require('./config/database'));

app.use(express.json());
app.use(require('cors')());
app.use(require('helmet')({ noSniff: false }));

require('./app')(app);

module.exports = server;
