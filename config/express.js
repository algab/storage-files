var express = require("express")
var bodyParser = require("body-parser")
var joi = require("joi")
var consign = require("consign")
var formidable = require("formidable")
var hasha = require("hasha")
var path = require("path")
var fsExtra = require("fs-extra")
var cors = require("cors")
const fs = require("fs")

var app = express()

app.set("joi",joi)
app.set("formidable",formidable)
app.set("hasha",hasha)
app.set("path",path)
app.set("fs-extra", fsExtra)
app.set("fs",fs)
app.set("port",3001)

app.use(express.static("./data"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

app.disable("x-powered-by")

consign({"cwd":"app/v1","verbose":false}).include("model").then("controller").then("route").into(app)

module.exports = app
