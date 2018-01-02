var express = require("express");
var bodyParser = require("body-parser");
var joi = require("joi");
var consign = require("consign");
var formidable = require("formidable");
var hasha = require("hasha");
var path = require("path");
var fsExtra = require("fs-extra");
const fs = require("fs");

var app = express();

app.set("joi",joi);
app.set("formidable",formidable);
app.set("hasha",hasha);
app.set("path",path);
app.set("fs-extra", fsExtra);
app.set("fs",fs);

app.use(express.static("./data"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

consign({"cwd":"app/v1","verbose":false}).include("model").then("controller").then("route").into(app);

module.exports = app;
