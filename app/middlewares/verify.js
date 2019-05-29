"use strict";

const crypto = require("crypto-js");

class VerifyFolder {
    constructor() {
        this.db = require("../../config/database");
        this.folder = this.folder.bind(this);
    }

    async folder(req, res, next) {
        try {
            let bucket = req.params.bucket;
            let param = req.params.param;
            if (param.search(new RegExp("[.]")) == -1) {
                let nick = await this.decrypt(req.headers.authorization.slice(7));
                let result = await this.db.all("SELECT name FROM buckets WHERE owner = ?", [nick]);
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

    async decrypt(token) {
        let bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
        let data = JSON.parse(bytes.toString(crypto.enc.Utf8));
        return data.nick;
    }
}

module.exports = new VerifyFolder();