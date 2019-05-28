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
                const result = await this.searchLogin(data.email,data.password);
                if (result == null) {
                    res.status(404).json({ "Message": "Email or password incorret" }).end();
                }
                else {
                    res.status(200).json(result).end();
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
                    await this.email.forgotPassword(user.name, user.email, password);
                    res.status(200).json({ "Message": "Password changed successful" }).end();
                }
                else {
                    let manager = await this.db.get("SELECT * FROM managers WHERE email = ?", [req.body.email]);  
                    if (manager) {
                        let password = await this.generatePassword();
                        let encryptPassword = hasha(password, { 'algorithm': 'sha256' });
                        await this.db.run("UPDATE managers SET password = ? WHERE id = ?", [encryptPassword, manager.id]);
                        await this.email.forgotPassword(manager.name, manager.email, password);
                        res.status(200).json({ "Message": "Password changed successful" }).end();
                    }
                    else {
                        res.status(404).json({ "Message": "Email not found" }).end();
                    }                  
                }
            }
            else {
                res.status(400).json({ "Message": "Email required" }).end();
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async searchLogin(email, password) {
        const user = await this.db.get("SELECT * FROM users WHERE email = ? and password = ?", [email, password]);
        if (user) {
            user.type = "user";
            user.token = await this.generateToken(user.nick, user.type);
            return user;
        }
        else {
            const manager = await this.db.get("SELECT * FROM managers WHERE email = ? and password = ?", [email, password]);
            if (manager) {
                manager.type = "manager";
                manager.token = await this.generateToken(String(manager.id), user.type);
                return manager;
            }
            else {
                return {};
            }
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