"use strict";

const app = require("./config/express");

if (process.env.PROTOCOL == "https") {
    const https = require("https")
    const fs = require("fs")

    const options = {
        key: fs.readFileSync(process.env.KEY,'utf-8'),
        cert: fs.readFileSync(process.env.CERT,'utf-8'),
        ca: fs.readFileSync(process.env.CA,'utf-8')
    }

    https.createServer(options,app).listen(app.get("port"),() => {
        console.log(`Server HTTPS Running on Port ${app.get("port")}`);
    })
}
else {
    app.listen(app.get("port"),() => {
        console.log(`Server HTTP Running on Port ${app.get("port")}`);    
    })
}