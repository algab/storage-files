"use strict";

const hasha = require("hasha");
const crypto = require("crypto-js");
const moment = require("moment-timezone");

class Login {
    constructor(app) {
        this.db = app.get("database");
        this.login = this.login.bind(this);
    }

    async login(req, res) {
        try {
            let data = req.body
            if (data.email && data.password) {
                data.password = hasha(data.password, { 'algorithm': 'md5' });
                const result = await this.db.all("SELECT * FROM users WHERE email = ? and password = ?", [data.email, data.password]);
                if (result[0] == null) {
                    res.status(404).json({ "Message": "Email or password incorret" }).end();
                }
                else {
                    result[0].token = await this.generateToken(result[0].nick, "user");
                    res.status(200).json(result[0]).end();
                }
            }
            else {
                res.status(400).json({ "Message": "Email and password required" }).end();
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async generateToken(nick, type) {
        const data = { nick, type, date: moment().tz('America/Fortaleza').format() };
        const encrypt = crypto.AES.encrypt(JSON.stringify(data), process.env.TOKEN_SECRET);
        return `Bearer ${encrypt.toString()}`;
    }
}

module.exports = app => { return new Login(app) }