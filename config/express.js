"use strict";

require("dotenv").config();

const express = require("express")
const consign = require("consign")
const server = require("socket.io")
const auth = require("./auth")
const database = require("./database")
const middleware = require("./middleware")

var app = express()

var io = new server(process.env.SOCKET_PORT)
io.set('origins', '*:*')

app.set("port", process.env.API_PORT || 3001);
app.set("version", "/v1");
app.set("auth", auth);
app.set("database", database);
app.set("middleware", middleware);
app.set("io", io);

app.use(express.json());
app.use(auth.initialize());
app.use(require("cors")());
app.use(require("helmet")());

consign({ "cwd": "app", "verbose": false }).include("models").then("controllers").then("routes").then(".").into(app);

module.exports = app;