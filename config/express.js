const express = require("express")
const consign = require("consign")
const cors = require("cors")
const hasha = require("hasha")
const server = require("socket.io")
const auth = require("./auth")
const database = require("./database")
const middleware = require("./middleware")

var app = express()

var io = new server(3002)
io.set('origins', '*:*')

app.set("auth",auth)
app.set("database",database)
app.set("middleware",middleware)
app.set("hasha",hasha)
app.set("io",io)
app.set("port",3001)

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(auth.initialize())
app.use(cors())

app.disable("x-powered-by")

consign({"cwd":"app/v1","verbose":true}).include("model").then("controller").then("route").then(".").into(app)

module.exports = app
