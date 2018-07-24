var express = require("express")
var joi = require("joi")
var consign = require("consign")
var formidable = require("formidable")
var fsExtra = require("fs-extra")
var cors = require("cors")
var hasha = require("hasha")
const fs = require("fs")
const util = require("util")
const auth = require("./auth")
const db = require("./database")

var app = express()

app.set("joi",joi)
app.set("formidable",formidable)
app.set("fs-extra", fsExtra)
app.set("fs",fs)
app.set("util",util)
app.set("auth",auth)
app.set("database",db)
app.set("hasha",hasha)
app.set("port",3001)

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())

app.disable("x-powered-by")

consign({"cwd":"app/v1","verbose":true}).include("model").then("controller").then("route").then(".").into(app)

module.exports = app
