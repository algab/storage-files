"use strict";

const hasha = require("hasha");
const crypto = require("crypto-js");
const moment = require("moment-timezone");

class User {
    constructor(app) {
        this.db = app.get("database");
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.password = this.password.bind(this);
        this.token = this.token.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        try {
            let data = req.body;
            const result = await this.verifyEmail(data.email);
            if (result) {
                let nick = await this.db.all("SELECT nick FROM users WHERE nick = ?", [data.nick]);
                if (nick.length != 0) {
                    res.status(409).json({ "Message": "Nick already exists" }).end();
                }
                else {
                    if (data.password) {
                        data.password = hasha(data.password, { 'algorithm': 'md5' });
                        data.date = moment().tz('America/Fortaleza').format();
                        await this.db.run("INSERT INTO users (nick,name,country,state,city,email,password,date) VALUES (?,?,?,?,?,?,?,?)", [data.nick, data.name, data.country, data.state, data.city, data.email, data.password, data.date]);
                        res.status(201).json(data).end();
                    }
                    else {
                        res.status(400).json({ "Message": "Password is required" }).end();
                    }
                }
            }
            else {
                res.status(409).json({ "Message": "Email conflict" }).end();                
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async list(req, res) {
        try {
            let users = await this.db.all("SELECT * FROM users");
            users = users.map(data => {
                delete data.password;
                return data;
            });
            res.status(200).json(users).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async search(req, res) {
        try {
            let nick = req.params.nick;
            let user = await this.db.get("SELECT * FROM users WHERE nick = ?", [nick]);
            if (user) {
                delete user.password;
            }
            res.status(200).json(user).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async edit(req, res) {
        try {
            let nick = req.params.nick;
            let data = req.body;
            let user = await this.db.all("SELECT email FROM users WHERE nick = ?", [nick]);
            if (data.email == user[0].email) {
                await this.db.run("UPDATE users SET name = ?, country = ?, state = ?, city = ?, email = ? WHERE nick = ?", [data.name, data.country, data.state, data.city, data.email, data.nick]);
                res.status(200).json({ "Message": "User updated successful" }).end();
            }
            else {
                let email = await this.db.all("SELECT email FROM users WHERE email = ?", [data.email])
                if (email.length == 0) {
                    await this.db.run("UPDATE users SET name = ?, country = ?, state = ?, city = ?, email = ? WHERE nick = ?", [data.name, data.country, data.state, data.city, data.email, data.nick]);
                    res.status(200).json({ "Message": "User updated successful" }).end();
                }
                else {
                    res.status(409).json({ "Message": "Email already exists" }).end()
                }
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async password(req, res) {
        try {
            let nick = req.params.nick;
            if (req.body.password) {
                req.body.password = hasha(req.body.password, { 'algorithm': 'md5' });
                await this.db.run("UPDATE users SET password = ? WHERE nick = ?", [req.body.password, nick]);
                res.status(200).json({ "Message": "Password changed successful" }).end();
            }
            else {
                res.status(400).json({ "Message": "Password is required" }).end()
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async token(req, res) {
        try {
            let nick = req.params.nick;
            const encrypt = crypto.AES.encrypt(JSON.stringify({ nick, type: "app", date: moment().tz('America/Fortaleza').format() }), process.env.TOKEN_SECRET);
            res.status(200).json({ "token": `Bearer ${encrypt.toString()}` }).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async delete(req, res) {
        try {
            let nick = req.params.nick;
            await this.db.run("DELETE FROM users WHERE nick = ?", [nick]);
            res.status(200).json({ "Message": "User removed successful" }).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async verifyEmail(email) {
        try {
            const user = await this.db.all("SELECT email FROM users WHERE email = ?", [email]);
            if (user.length == 0) {
                const manager = await this.db.all("SELECT email FROM managers WHERE email = ?", [email]);
                if (manager.length == 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
}

module.exports = app => { return new User(app) }