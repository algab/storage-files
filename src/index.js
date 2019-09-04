require('dotenv').config();

const express = require('express');

const app = express();

const server = require('http').Server(app);

app.set('version', '/v1');
app.set('logger', require('./config/logger'));
app.set('socket', require('socket.io')(server));

app.use(express.json());
app.use(require('cors')());
app.use(require('helmet')({ noSniff: false }));

require('./api')(app);

(async () => {
    await server.listen(process.env.PORT);
    console.log(`API Running on Port ${process.env.PORT}`);
})();
