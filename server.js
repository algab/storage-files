"use strict";

const app = require("./src");

app.listen(process.env.API_PORT, () => {
    console.log(`API Running on Port ${process.env.API_PORT}`);
});