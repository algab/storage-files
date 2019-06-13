"use strict";

require("dotenv").config();

const express = require("express");
const database = require("./config/database");

var app = express();

const server = require("http").Server(app);
const socket = require("socket.io")(server);

app.set("version", "/v1");
app.set("database", database);
app.set("socket", socket);

app.use(express.json());
app.use(require("cors")());
app.use(require("helmet")({ noSniff: false }));

require("./app")(app);

module.exports = server;