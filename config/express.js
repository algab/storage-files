"use strict";

require("dotenv").config();

const express = require("express");
const consign = require("consign");
const database = require("./database");
const socket = require("./socket");

var app = express();

app.set("port", process.env.API_PORT || 3001);
app.set("version", "/v1");
app.set("database", database);
app.set("socket", socket);

app.use(express.json());
app.use(require("cors")());
app.use(require("helmet")());

consign({ "cwd": "app", "verbose": false }).include("models").then("controllers").then("routes").into(app);

module.exports = app;