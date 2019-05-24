"use strict";

const crypto = require("crypto-js");

module.exports = () => {
    return (req, res, next) => {
        try {
            let bucket = req.params.bucket;
            let param = req.params.param;
            if (param.search(new RegExp("[.]")) == -1) {
                let token = req.headers.authorization.slice(7);
                let bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
                let data = JSON.parse(bytes.toString(crypto.enc.Utf8));
                let result = await all("SELECT name FROM folders WHERE owner = ?", [data.nick]);
                if (result[0].name === bucket) {
                    res.locals.folder = true;
                    next();
                }
                else {
                    res.status(401).send('Unauthorized').end();
                }
            }
            else {
                next();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }
}