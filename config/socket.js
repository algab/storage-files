"use strict";

const socket = require("socket.io");

var server = new socket(process.env.SOCKET_PORT);

server.set('origins', '*:*');

module.exports = server;