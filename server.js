"use strict";

const app = require("./config/express");

app.listen(app.get("port"), () => {
    console.log(`API Running on Port ${process.env.API_PORT} and SocketIO Running on Port ${process.env.SOCKET_PORT}`);
});