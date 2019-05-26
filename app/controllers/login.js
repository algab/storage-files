"use strict";

const hasha = require("hasha");
const crypto = require("crypto-js");
const moment = require("moment-timezone");

class Login {
    constructor(app) {
        this.db = app.get("database");
        this.email = require("../services/email");
        this.login = this.login.bind(this);
        this.password = this.password.bind(this);
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

    async password(req, res) {
        try {
            if (req.body.email) {
                let user = await this.db.get("SELECT * FROM users WHERE email = ?", [req.body.email]);
                if (user) {
                    let password = await this.generatePassword();
                    let encryptPassword = hasha(password, { 'algorithm': 'sha256' });
                    await this.db.run("UPDATE users SET password = ? WHERE nick = ?", [encryptPassword, user.nick]);
                    await this.email.forgotPassword(user.name,user.email,password);
                    res.status(200).json({ "Message": "Password changed successful" }).end();
                }
                else {
                    res.status(404).json({ "Message": "Email not found" }).end();
                }
            }
            else {
                res.status(400).json({ "Message": "Email required" }).end();
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async generatePassword() {
        let password = "";
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 8; i++) {
            password = password.concat(chars.charAt(Math.random() * 61));
        }
        return password;
    }

    async generateToken(nick, type) {
        const data = { nick, type, date: moment().tz('America/Fortaleza').format() };
        const encrypt = crypto.AES.encrypt(JSON.stringify(data), process.env.TOKEN_SECRET);
        return `Bearer ${encrypt.toString()}`;
    }
}

module.exports = app => { return new Login(app) }