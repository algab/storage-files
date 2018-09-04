require("dotenv").load()

const app = require("./config/express")

if (process.env.protocol == "https") {
    const https = require("https")
    const fs = require("fs")

    const options = {
        key: fs.readFileSync(process.env.key,'utf-8'),
        cert: fs.readFileSync(process.env.cert,'utf-8'),
        ca: fs.readFileSync(process.env.ca,'utf-8')
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