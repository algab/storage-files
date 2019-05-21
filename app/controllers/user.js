"use strict";

const hasha = require("hasha");
const moment = require("moment-timezone");

class User {
    constructor(app) {
        this.db = app.get("database");
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.password = this.password.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        try {
            let data = req.body;
            let email = await this.db.all("SELECT * FROM users WHERE email = ?", [data.email]);            
            if (email.length != 0) {
                res.status(409).json({ "Message": "Email already exists" }).end();
            }
            else {
                let nick = await this.db.all("SELECT nick FROM users WHERE nick = ?", [data.nick]);
                if (nick.length != 0) {
                    res.status(409).json({ "Message": "Nick already exists" }).end();
                }
                else {
                    if (data.password) {
                        data.password = hasha(data.password, { 'algorithm': 'md5' });
                        data.date = moment().tz('America/Fortaleza').format();
                        data.token = hasha(`${data.nick}/${data.password}/${new Date().getTime()}`, { 'algorithm': 'md5' });
                        await this.db.run("INSERT INTO users (nick,name,country,state,city,email,password,token,date) VALUES (?,?,?,?,?,?,?,?,?)", [data.nick, data.name, data.country, data.state, data.city, data.email, data.password, data.token, data.date]);
                        res.status(201).json(data).end();
                    }
                    else {
                        res.status(400).json({ "Message": "Password is required" }).end();
                    }
                }
            }
        } catch (error) {          
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async list(req, res) {
        try {
            let users = await this.db.all("SELECT * FROM users");
            res.status(200).json(users).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async search(req, res) {
        try {
            let nick = req.params.nick;
            let user = await this.db.all("SELECT * FROM users WHERE nick = ?", [nick]);
            res.status(200).json(user[0]).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async edit(req, res) {
        try {
            let nick = req.params.nick;
            let data = req.body;
            let user = await this.db.all("SELECT email FROM users WHERE nick = ?", [nick]);
            if (data.password) {
                delete data.password;
            }
            if (data.email == user[0].email) {
                await this.db.run("UPDATE users SET name = ?, country = ?, state = ?, city = ?, email = ?, password = ? WHERE nick = ?", [data.name, data.country, data.state, data.city, data.email, data.password, data.nick]);
                res.status(200).json({ "Message": "User updated successful" }).end();
            }
            else {
                let email = await this.db.all("SELECT email FROM users WHERE email = ?", [data.email])
                if (email.length == 0) {
                    await this.db.run("UPDATE users SET name = ?, country = ?, state = ?, city = ?, email = ?, password = ? WHERE nick = ?", [data.name, data.country, data.state, data.city, data.email, data.password, data.nick]);
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
                res.status(200).json({ "Message": "Password change successful" }).end();
            }
            else {
                res.status(400).json({ "Message": "Password is required" }).end()
            }
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
}

module.exports = app => { return new User(app) }